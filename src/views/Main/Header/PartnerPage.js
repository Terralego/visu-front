import React from 'react';
import { Card } from '@blueprintjs/core';

const logosPath = [];

const PartnerPage = () => (
  <Card>
    <h3>Partenaires</h3>
    <div className="partner-logo-container">
      { logosPath.map(({ name, path, logo }) => (
        <a
          key={name}
          href={path}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="partner-logo"
            src={logo}
            alt={name}
          />
        </a>
      ))}
    </div>
  </Card>
);

export default PartnerPage;
