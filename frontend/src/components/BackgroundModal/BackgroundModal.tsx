import { useCallback, useEffect, useState } from 'react';

import {
  Button,
  ButtonColors,
  ButtonTypes,
  ButtonVariants,
  Card,
  Grid,
  Heading,
  Image,
  Modal,
  useEdificeClient,
} from '@edifice.io/react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { backgroundColors, backgroundImages } from '~/config';
import {
  CollaborativeWallProps,
  PickedCollaborativeWallProps,
} from '~/models/wall';
import { useWebsocketStore } from '~/store';

const THUMBNAIL_WIDTH = 288;
const THUMBNAIL_HEIGHT = 180;

export default function BackgroundModal({
  wall,
  isOpen,
  setIsOpen,
}: {
  wall: CollaborativeWallProps;
  isOpen: boolean;
  setIsOpen: (bool: boolean) => void;
}): JSX.Element | null {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const { sendWallUpdateEvent } = useWebsocketStore();

  const [backgroundImageValue, setBackgroundImageValue] = useState<string>(
    wall?.background?.path || '',
  );
  const [backgroundColorValue, setBackgroundColorValue] = useState<string>(
    wall?.background?.color || '',
  );

  const renderImage = useCallback(
    (image: string) =>
      import.meta.env.PROD ? `/collaborativewall/public/${image}` : `/${image}`,
    [],
  );

  const renderColor = (color: string) => `linear-gradient(${color})`;

  const renderColorStyle = (color: string) => ({
    background: renderColor(color),
    width: '100%',
    height: '52px',
    paddingBottom: '75%',
  });

  const renderImageStyle = {
    margin: 'auto',
    background: renderColor(backgroundColorValue),
  };

  const renderThumbnailStyle = {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    margin: 'auto',
    background: renderColor(backgroundColorValue),
  };

  const renderMainChoice =
    backgroundImageValue !== '' ? (
      <Image
        src={renderImage(backgroundImageValue)}
        alt=""
        width={THUMBNAIL_WIDTH}
        height={THUMBNAIL_HEIGHT}
        style={renderImageStyle}
      />
    ) : (
      <div style={renderThumbnailStyle}></div>
    );

  const handleClose = () => setIsOpen(false);

  const handleOnSelectImage = useCallback((image: string) => {
    setBackgroundImageValue(image);
    setBackgroundColorValue('');
  }, []);

  const handleOnSelectColor = useCallback((color: string) => {
    setBackgroundColorValue(color);
    setBackgroundImageValue('');
  }, []);

  const handleSaveWall = async () => {
    const newWall: PickedCollaborativeWallProps = {
      background: {
        path: backgroundImageValue,
        color: backgroundColorValue,
      },
      description: wall.description,
      name: wall.name,
      icon: wall.icon,
    };
    await sendWallUpdateEvent({ ...newWall, _id: wall._id });
    setIsOpen(false);
  };

  useEffect(() => {
    setBackgroundImageValue(wall.background.path);
  }, [wall.background]);

  const backgroundModalActions: {
    type: ButtonTypes;
    color: ButtonColors;
    variant: ButtonVariants;
    text: string;
    onClick: () => void;
  }[] = [
    {
      type: 'button',
      color: 'tertiary',
      variant: 'ghost',
      text: t('close'),
      onClick: handleClose,
    },
    {
      type: 'button',
      color: 'primary',
      variant: 'filled',
      text: t('edit'),
      onClick: handleSaveWall,
    },
  ];

  const thumbnails = [
    {
      type: 'image',
      text: 'collaborativewall.label.images',
      elements: backgroundImages,
      value: backgroundImageValue,
      onClick: handleOnSelectImage,
      render: renderImage,
    },
    {
      type: 'color',
      text: 'collaborativewall.label.colors',
      elements: backgroundColors,
      value: backgroundColorValue,
      onClick: handleOnSelectColor,
      render: renderColor,
    },
  ];

  const thumbnailStyle = { borderRadius: '4px' };

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
            {t('collaborativewall.modal.background', { ns: appCode })}
          </Modal.Header>
          <Modal.Body>
            <div className="my-16">{renderMainChoice}</div>
            {thumbnails.map((thumbnail) => (
              <div className="my-8" key={thumbnail.type}>
                <Heading className="py-8" headingStyle="h5">
                  {t(thumbnail.text, { ns: appCode })}
                </Heading>
                <Grid className="py-8">
                  {thumbnail.elements.map((item) => {
                    const isSelected = thumbnail.value === item;
                    return (
                      <Grid.Col sm="2" key={item}>
                        <Card
                          isClickable={true}
                          isSelectable={false}
                          isSelected={isSelected}
                          onClick={() => thumbnail.onClick(item)}
                        >
                          <Card.Body space="0">
                            {thumbnail.type === 'image' ? (
                              <Image
                                src={thumbnail.render(item)}
                                alt=""
                                ratio="4"
                                style={thumbnailStyle}
                              />
                            ) : (
                              <div style={renderColorStyle(item)}></div>
                            )}
                          </Card.Body>
                        </Card>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </div>
            ))}
          </Modal.Body>
          <Modal.Footer>
            {backgroundModalActions.map((button) => (
              <Button
                key={button.text}
                type={button.type}
                color={button.color}
                variant={button.variant}
                onClick={button.onClick}
              >
                {button.text}
              </Button>
            ))}
          </Modal.Footer>
        </Modal>,
        document.getElementById('portal') as HTMLElement,
      )
    : null;
}
