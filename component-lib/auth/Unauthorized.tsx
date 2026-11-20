import React from 'react';
import { Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const Unauthorized: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className="p-4">
      <Alert variant="warning">
        {t('unauthorized', 'You do not have permission to access this page.')}
      </Alert>
    </div>
  );
};

export default Unauthorized;