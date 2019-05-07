import React from 'react';
import { Card } from '@blueprintjs/core';

import logoRegionSud from '../../../images/logo_regionSud.png';
import logoCCIR from '../../../images/logo_CCIR.jpg';
import logoCrige from '../../../images/logo_crige.png';
import logoDreal from '../../../images/logo_dreal.png';
import logoEpf from '../../../images/logo_EPF-PACA.png';

const logosPath = [{
  name: 'ccir',
  path: 'http://www.paca.cci.fr/',
  logo: logoCCIR,
}, {
  name: 'crige',
  path: 'http://www.crige-paca.org/',
  logo: logoCrige,
}, {
  name: 'dreal',
  path: 'http://www.paca.developpement-durable.gouv.fr/',
  logo: logoDreal,
}, {
  name: 'epf',
  path: 'http://www.epfpaca.com/',
  logo: logoEpf,
}, {
  name: 'RegionSud',
  path: 'https://www.maregionsud.fr/',
  logo: logoRegionSud,
}];

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
            label={name}
            alt={name}
          />
        </a>
      ))}
    </div>
  </Card>
);

export default PartnerPage;
