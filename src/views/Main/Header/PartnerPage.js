import React from 'react';
import { Card } from '@blueprintjs/core';


const PartnerPage = () => (
  <Card>
    <div className="mentions-legales">
      <h3 className="mentions-legales-title">Mentions légales</h3>
      <div className="mentions-legales-container">
        <p>
          Le portail Cart’en main est édité par l'Agence d'Urbanisme de la Région Nantaise (Auran).
        </p>

        <div className="container-block">
          <h4>Directeur de publication</h4>
          <p>Benoist PAVAGEAU</p>
        </div>

        <div className="container-block">
          <h4>Société éditrice du site</h4>
          <address>
            <p>Agence d'Urbanisme de la Région Nantaise</p>
            <p>2, Cours du champ de Mars - BP 60827 - 44008 NANTES Cedex 1</p>
            <p>Tél&nbsp;: <a href="tel:+33240841418">02.40.84.14.18</a> - Fax&nbsp;: <a href="fax:+33240840120">02.40.84.01.20</a></p>
            <p>Courriel&nbsp;: <a href="mailto:contact@auran.org">contact@auran.org</a></p>
            <p>Site&nbsp;: <a href="https://auran.org">www.auran.org</a></p>
          </address>
        </div>

        <div className="container-block">
          <h4>Crédits</h4>
          <p>Portail cartographique de l'Agence d'Urbanisme de la Région Nantaise (Auran)</p>
        </div>

        <div className="container-block">
          <h4>Réalisation du portail</h4>
          <p>
            Conception, design, conception technique et développement&nbsp;:
          </p>
          <p>
            <a href="https://makina-corpus.com/">Makina Corpus</a> et <a href="https://auran.org">Agence d'Urbanisme de la Région Nantaise (Auran)</a>
          </p>
        </div>

        <div className="container-block">
          <h4>Contenu éditorial</h4>
          <p>Agence d'Urbanisme de la Région Nantaise (Auran)</p>
        </div>

        <div className="container-block">
          <h4>Propriété intellectuelle et copyright</h4>
          <p>
            Les contenus de ce site sont la propriété exclusive de l'Agence d'Urbanisme
            de la Région Nantaise et sont protégés par le droit d'auteur.
          </p>
          <p>
            Toute réutilisation des données et informations est libre, à la condition
            que ces dernières ne soient pas
            altérées, que leur sens ne soit pas dénaturé, et que leurs sources soient mentionnées.
          </p>
          <p>
            L'ensemble de ce site est protégé par copyright
            «&nbsp;Agence d'Urbanisme de la Région Nantaise&nbsp;».
          </p>
        </div>
      </div>
    </div>
  </Card>
);

export default PartnerPage;
