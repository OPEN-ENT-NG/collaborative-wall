import {
  Cantoo,
  Mic,
  MicOff,
  TextToSpeech,
  TextToSpeechOff,
  Wand,
} from '@edifice-ui/icons';
import {
  Dropdown,
  IconButton,
  IconButtonProps,
  Tooltip,
} from '@edifice-ui/react';
import { Fragment, RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { useCantooEditor } from '@edifice-ui/editor';
interface Props {
  triggerProps: JSX.IntrinsicAttributes &
    Omit<IconButtonProps, 'ref'> &
    RefAttributes<HTMLButtonElement>;
  openModal: () => void;
}
export const NoteCantoo = ({ triggerProps, openModal }: Props) => {
  const { t } = useTranslation();

  const {
    speech2textIsActive,
    text2speechIsActive,
    toggleSpeech2Text,
    toggleText2Speech,
    formatText,
  } = useCantooEditor(null);

  const cantooOptions = [
    {
      id: 'speech2text',
      label: t('tiptap.toolbar.cantoo.speech2text'),
      className: speech2textIsActive ? 'fw-bold' : '',
      icon: speech2textIsActive ? <MicOff /> : <Mic />,
      action: () => toggleSpeech2Text(),
    },
    {
      id: 'text2speech',
      label: t('tiptap.toolbar.cantoo.text2speech'),
      className: text2speechIsActive ? 'fw-bold' : '',
      icon: text2speechIsActive ? <TextToSpeechOff /> : <TextToSpeech />,
      action: () => toggleText2Speech(),
    },
    {
      id: 'formatText',
      label: t('tiptap.toolbar.cantoo.formatText'),
      icon: <Wand />,
      action: () => formatText(openModal),
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
          icon={<Cantoo />}
          className={
            speech2textIsActive || text2speechIsActive
              ? 'is-selected bg-blue-200'
              : 'bg-blue-200'
          }
          aria-label={t('tiptap.toolbar.cantoo.choice')}
        />
      </Tooltip>
      <Dropdown.Menu>
        {cantooOptions.map((option) => {
          return (
            <Fragment key={option.id}>
              <Dropdown.Item onClick={option.action} icon={option.icon}>
                <span className={option.className}>{option.label}</span>
              </Dropdown.Item>
            </Fragment>
          );
        })}
      </Dropdown.Menu>
    </>
  );
};
