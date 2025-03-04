import { FC, Fragment } from 'react';
import {
  AvatarGroup,
  Avatar,
  Dropdown,
  Card,
  Switch,
  PreventPropagation,
  useEdificeClient,
  StackedGroup,
} from '@edifice.io/react';
import { useUserList } from '~/hooks/useUserList';
import { useTranslation } from 'react-i18next';

export interface User {
  name: string;
  avatar: string;
  isMe?: boolean;
  role?: string;
}

export const UserList: FC = () => {
  const { appCode } = useEdificeClient();
  const { connectedUsers } = useUserList();
  const { t } = useTranslation();
  const userLabel =
    connectedUsers.length === 1
      ? t(`collaborativewall.user.online.single`, { ns: appCode })
      : t(`collaborativewall.user.online.many`, {
          count: connectedUsers.length,
          ns: appCode,
        });
  return (
    <StackedGroup
      overlap={8}
      stackingOrder="leftFirst"
      className="pe-16 me-16 border-end"
    >
      <AvatarGroup
        maxAvatars={3}
        src={connectedUsers.map((u) => u.avatar)}
        alt={userLabel}
        size="sm"
        overlap={8}
        innerBorderColor="secondary"
        innerBorderWidth={2}
        outerBorderColor="white"
        outerBorderWidth={2}
      />

      <Dropdown placement="bottom-end">
        <Dropdown.Trigger
          pill
          baseShade
          variant="secondary"
          className="bold"
          innerBorderColor="secondary"
          innerBorderWidth={2}
          outerBorderColor="white"
          outerBorderWidth={2}
          size="sm"
          label={<b>{userLabel}</b>}
        />

        <Dropdown.Menu unselectable="on">
          <Dropdown.Item>
            <Card.Body space="8" padding="0">
              <PreventPropagation>
                <Switch
                  label={t('collaborativewall.user.cursors.display', {
                    ns: appCode,
                  })}
                  labelClassName="small"
                />
              </PreventPropagation>
            </Card.Body>
          </Dropdown.Item>

          <Dropdown.Separator />

          {connectedUsers.map((user, index) => (
            <Fragment key={`${index}`}>
              <Dropdown.Item minWidth={340}>
                <Card.Body space="8" padding="0">
                  <div className="card-image ps-8 pe-4">
                    <Avatar
                      variant="circle"
                      alt={user.name}
                      src={user.avatar}
                      size="sm"
                    />
                  </div>
                  <div className="w-75">
                    <Card.Text>
                      {user.isMe ? (
                        <b>{t('collaborativewall.user.me', { ns: appCode })}</b>
                      ) : (
                        user.name
                      )}
                    </Card.Text>
                    <Card.Text className="text-black-50">
                      <i>
                        {t(`collaborativewall.user.right.${user.right}`, {
                          ns: appCode,
                        })}
                      </i>
                    </Card.Text>
                  </div>
                </Card.Body>
              </Dropdown.Item>
            </Fragment>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </StackedGroup>
  );
};
