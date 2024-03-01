import { useState } from "react";

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

import { backgroundImages, defaultBackground } from "~/config/init-config";
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

  const [backgroundValue, setBackgroundValue] = useState<string>("");
  const updateWall = useUpdateWall();

  const handleClose = () => setIsOpen(false);

  const handleSaveNote = () => {
    const newWall: PickedCollaborativeWallProps = {
      background: backgroundValue,
      description: wall.description,
      name: wall.name,
    };
    updateWall.mutateAsync({ wallId: wall._id, newWall });
  };

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
                src={wall.background ?? defaultBackground}
                className="py-16"
                alt=""
                width={288}
                height={180}
                style={{ margin: "auto" }}
              />
              <Heading className="py-8" headingStyle="h5">
                {t("collaborativewall.images")}
              </Heading>
              <Grid>
                {backgroundImages.map((image) => (
                  <Grid.Col sm="2">
                    <Card
                      isClickable={true}
                      isSelectable={false}
                      onClick={() => setBackgroundValue(image)}
                    >
                      <Card.Body space="0">
                        <Image
                          src={image}
                          alt=""
                          ratio="4"
                          style={{ borderRadius: "4px" }}
                        />
                      </Card.Body>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
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
              onClick={handleSaveNote}
            >
              {t("collaborativewall.modal.modify", { ns: appCode })}
            </Button>
          </Modal.Footer>
        </Modal>,
        document.getElementById("portal") as HTMLElement,
      )
    : null;
}
