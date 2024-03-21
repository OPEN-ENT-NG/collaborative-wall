import { useEffect, useState } from "react";

import {
  Modal,
  Button,
  useOdeClient,
  Image,
  Heading,
  Grid,
  Card,
} from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { backgroundColors, backgroundImages } from "~/config/init-config";
import {
  CollaborativeWallProps,
  PickedCollaborativeWallProps,
} from "~/models/wall";
import { useUpdateWall } from "~/services/queries";

export default function BackgroundModal({
  isOpen,
  setIsOpen,
  wall,
}: {
  isOpen: boolean;
  setIsOpen: (bool: boolean) => void;
  wall: CollaborativeWallProps;
}): JSX.Element | null {
  const { appCode } = useOdeClient();
  const { t } = useTranslation();

  const [backgroundImageValue, setBackgroundImageValue] = useState<string>(
    wall.background.path,
  );
  const [backgroundColorValue, setBackgroundColorValue] = useState<string>(
    wall.background.color,
  );

  const updateWall = useUpdateWall();

  const handleClose = () => setIsOpen(false);

  const handleSaveWall = () => {
    const newWall: PickedCollaborativeWallProps = {
      background: {
        path: backgroundImageValue,
        color: backgroundColorValue,
      },
      description: wall.description,
      name: wall.name,
      icon: wall.icon,
    };
    updateWall.mutate({ wallId: wall._id, newWall });
  };

  useEffect(() => {
    setBackgroundImageValue(wall.background.path);
  }, [isOpen, wall.background]);

  return isOpen
    ? createPortal(
        <Modal
          id="BackgroundModal"
          onModalClose={handleClose}
          size="md"
          isOpen={isOpen}
          focusId="nextButtonId"
        >
          <Modal.Header onModalClose={handleClose}>
            {t("collaborativewall.modal.background", { ns: appCode })}
          </Modal.Header>
          <Modal.Body>
            <>
              <Image
                src={
                  import.meta.env.PROD
                    ? `/collaborativewall/public/${backgroundImageValue}`
                    : `/${backgroundImageValue}`
                }
                className="py-16"
                alt=""
                width={288}
                height={180}
                style={{
                  margin: "auto",
                  background: `linear-gradient(${backgroundColorValue})`,
                }}
              />
              <div className="my-8">
                <Heading className="py-8" headingStyle="h5">
                  {t("collaborativewall.images")}
                </Heading>
                <Grid className="py-8">
                  {backgroundImages.map((image) => {
                    const isSelected = backgroundImageValue === image;
                    return (
                      <Grid.Col sm="2" key={image}>
                        <Card
                          isClickable={true}
                          isSelectable={false}
                          isSelected={isSelected}
                          onClick={() => setBackgroundImageValue(image)}
                        >
                          <Card.Body space="0">
                            <Image
                              src={
                                import.meta.env.PROD
                                  ? `/collaborativewall/public/${image}`
                                  : `/${image}`
                              }
                              alt=""
                              ratio="4"
                              style={{ borderRadius: "4px" }}
                            />
                          </Card.Body>
                        </Card>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </div>
              <div className="py-8">
                <Heading className="py-8" headingStyle="h5">
                  {t("collaborativewall.colors")}
                </Heading>
                <Grid className="my-8">
                  {backgroundColors.map((color) => {
                    const isSelected = backgroundColorValue === color;
                    return (
                      <Grid.Col sm="2" key={color}>
                        <Card
                          isClickable={true}
                          isSelectable={false}
                          isSelected={isSelected}
                          onClick={() => setBackgroundColorValue(color)}
                        >
                          <Card.Body space="0">
                            <div
                              style={{
                                background: `linear-gradient(${color})`,
                                width: "100%",
                                height: "52px",
                                paddingBottom: "75%",
                              }}
                            ></div>
                          </Card.Body>
                        </Card>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </div>
            </>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              color="tertiary"
              variant="ghost"
              onClick={handleClose}
            >
              {t("collaborativewall.modal.cancel", { ns: appCode })}
            </Button>
            <Button
              type="button"
              color="primary"
              variant="filled"
              onClick={handleSaveWall}
            >
              {t("collaborativewall.modal.modify", { ns: appCode })}
            </Button>
          </Modal.Footer>
        </Modal>,
        document.getElementById("portal") as HTMLElement,
      )
    : null;
}
