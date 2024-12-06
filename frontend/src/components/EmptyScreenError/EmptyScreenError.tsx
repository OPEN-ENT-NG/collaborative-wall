import { EmptyScreen } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';

import illuError from '@images/emptyscreen/illu-error.svg';

export const EmptyScreenError = () => {
  const { t } = useTranslation();

  return (
    <EmptyScreen
      imageSrc={illuError}
      imageAlt={t('explorer.emptyScreen.error.alt')}
      text={'explorer.emptyScreen.error.text'}
    />
  );
};
