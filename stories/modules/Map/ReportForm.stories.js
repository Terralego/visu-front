import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import ReportForm from '../../../modules/Map/Map/components/ReportControl/ReportForm';
import ReportCard from '../../../modules/Map/Map/components/ReportControl/ReportCard';

import translate from './reportTranslateMock';

const stories = storiesOf('Map components/Report', module);
stories
  .add('Card', () => (
    <ReportCard
      isOpen
      cancelReport={action('cancel-report')}
      onSubmit={action('report-submit')}
      reportUrl="url/of/the/report/"
      translate={translate}
    />
  ))
  .add('Form', () => (
    <ReportForm
      url="someUrl"
      onSubmit={action('form-submit')}
      coordinates="48,43"
      translate={translate}
    />
  ));
