import { usePaths, EmptyScreen } from '@edifice-ui/react';
import { useTranslation } from 'react-i18next';

export const EmptyScreenError = () => {
  const [imagePath] = usePaths();
  const { t } = useTranslation();

  return (
    <EmptyScreen
      imageSrc={`${imagePath}/emptyscreen/illu-error.svg`}
      imageAlt={t('explorer.emptyScreen.error.alt')}
      text={'explorer.emptyScreen.error.text'}
    />
  );
};
