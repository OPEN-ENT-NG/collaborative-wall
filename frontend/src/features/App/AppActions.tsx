import { Fragment, RefAttributes } from 'react';

import {
  Dropdown,
  DropdownMenuOptions,
  IconButton,
  IconButtonProps,
  useEdificeClient,
} from '@edifice.io/react';
import {
  IconOptions,
  IconPrint,
  IconSetBackground,
  IconSettings,
  IconShare,
} from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';

import { useAccessStore } from '~/hooks/useAccessStore';
import { useWall } from '~/services/queries';
import { useWhiteboardStore } from '~/store';

export type ActionDropdownMenuOptions = DropdownMenuOptions & {
  id: string;
  visibility?: boolean;
};

export const AppActions = () => {
  const { wall } = useWall();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  /** Store to handle correctly rights to access ressource to avoid unexpected re-renders  */
  const { userRights } = useAccessStore();

  /* When destructring methods, it's okay to not shallow. We doesn't use stored state */
  const { setOpenShareModal, setOpenUpdateModal, setIsOpenBackgroundModal } =
    useWhiteboardStore();

  const dropdownOptions: ActionDropdownMenuOptions[] = [
    {
      id: 'background',
      label: t('collaborativewall.modal.background', { ns: appCode }),
      icon: <IconSetBackground />,
      action: () => setIsOpenBackgroundModal(true),
      visibility: userRights.creator || userRights.manager,
    },
    {
      id: 'share',
      label: t('share'),
      icon: <IconShare />,
      action: () => setOpenShareModal(true),
      visibility: userRights.creator || userRights.manager,
    },
    {
      id: 'properties',
      label: t('properties'),
      icon: <IconSettings />,
      action: () => setOpenUpdateModal(true),
      visibility: userRights.creator || userRights.manager,
    },
    {
      id: 'print',
      label: t('print'),
      icon: <IconPrint />,
      action: () => window.open(`/collaborativewall/print/id/${wall?._id}`),
      visibility: true,
    },
  ];

  return (
    <Dropdown>
      {(
        triggerProps: JSX.IntrinsicAttributes &
          Omit<IconButtonProps, 'ref'> &
          RefAttributes<HTMLButtonElement>,
      ) => (
        <>
          <IconButton
            {...triggerProps}
            type="button"
            aria-label="label"
            color="primary"
            variant="outline"
            icon={<IconOptions />}
          />

          <Dropdown.Menu>
            {dropdownOptions.map((option) => (
              <Fragment key={option.id}>
                {option.type === 'divider' ? (
                  <Dropdown.Separator />
                ) : (
                  option.visibility && (
                    <Dropdown.Item
                      icon={option.icon}
                      onClick={() => option.action(null)}
                    >
                      {option.label}
                    </Dropdown.Item>
                  )
                )}
              </Fragment>
            ))}
          </Dropdown.Menu>
        </>
      )}
    </Dropdown>
  );
};
