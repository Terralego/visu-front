import React from 'react';
import { Card } from '@blueprintjs/core';


const PartnerPage = ({ content }) => (
  <Card>
    <div className="mentions-legales">
      {content
        ? <div dangerouslySetInnerHTML={{ __html: content }} />
        : <h1>Put your partner data here</h1>
      }
    </div>
  </Card>
);

export default PartnerPage;
