import {
  Dropdown,
  IconButton,
  IconButtonProps,
  Tooltip,
} from '@edifice.io/react';
import {
  IconCantoo,
  IconMic,
  IconMicOff,
  IconTextToSpeech,
  IconTextToSpeechOff,
  IconWand,
} from '@edifice.io/react/icons';
import { Fragment, RefAttributes, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  triggerProps: JSX.IntrinsicAttributes &
    Omit<IconButtonProps, 'ref'> &
    RefAttributes<HTMLButtonElement>;
  content: string;
  openCantooAdaptTextBox: () => void;
}
export const NoteCantoo = ({
  triggerProps,
  content,
  openCantooAdaptTextBox,
}: Props) => {
  const { t } = useTranslation();
  const [speech2textIsActive, setSpeech2textActive] = useState(false);
  const [text2speechIsActive, setText2speechActive] = useState(false);
  const Cantoo = (window as any).Cantoo;
  const toggleSpeech2Text = async () => {
    if (speech2textIsActive) {
      setSpeech2textActive(false);
      try {
        await Cantoo.speech2text.stop();
      } catch (e) {
        console.warn('Error while trying to stop Cantoo (speech2text)', e);
      }
    } else {
      try {
        setSpeech2textActive(true);
        if (await Cantoo.speech2text.isAvailableOnDevice()) {
          if (await Cantoo.speech2text.requestPermission()) {
            await Cantoo.speech2text.start(content, window.navigator.language);
          } else {
            throw new Error('Permission denied');
          }
        } else {
          throw new Error('Cantoo not available');
        }
      } catch (e) {
        console.warn('Error while trying to use Cantoo (speech2text)', e);
        setSpeech2textActive(false);
      }
    }
  };
  const toggleText2Speech = () => {
    if (text2speechIsActive) {
      setText2speechActive(false);
      window.speechSynthesis.cancel();
    } else {
      try {
        setText2speechActive(true);
        Cantoo.text2speech.readText(content);
        Cantoo.text2speech.utter.onend = () => {
          setText2speechActive(false);
        };
      } catch (e) {
        console.warn('Error while trying to use Cantoo (text2speech)', e);
        setText2speechActive(false);
      }
    }
  };

  const cantooOptions = [
    {
      id: 'speech2text',
      label: t('tiptap.toolbar.cantoo.speech2text'),
      icon: speech2textIsActive ? <IconMicOff /> : <IconMic />,
      action: () => toggleSpeech2Text(),
    },
    {
      id: 'text2speech',
      label: t('tiptap.toolbar.cantoo.text2speech'),
      icon: text2speechIsActive ? (
        <IconTextToSpeechOff />
      ) : (
        <IconTextToSpeech />
      ),
      action: () => toggleText2Speech(),
    },
    {
      id: 'formatText',
      label: t('tiptap.toolbar.cantoo.formatText'),
      icon: <IconWand />,
      action: () => openCantooAdaptTextBox(),
    },
  ];

  return (
    <>
      <Tooltip message={t('tiptap.toolbar.cantoo.choice')} placement={'top'}>
        <IconButton
          {...triggerProps}
          type={'button'}
          variant="ghost"
          color="tertiary"
          icon={<IconCantoo />}
          className={'bg-blue-200'}
          aria-label={t('tiptap.toolbar.cantoo.choice')}
        />
      </Tooltip>
      <Dropdown.Menu>
        {cantooOptions.map((option) => {
          return (
            <Fragment key={option.id}>
              <Dropdown.Item onClick={option.action} icon={option.icon}>
                <span>{option.label}</span>
              </Dropdown.Item>
            </Fragment>
          );
        })}
      </Dropdown.Menu>
    </>
  );
};
