import React from 'react';
import classnames from 'classnames';
import { Tag, Intent, Position, Popover, PopoverInteractionKind, Button, AnchorButton } from '@blueprintjs/core';
import ColumnsSelector from '@terralego/core/modules/Table/components/ColumnsSelector';

import Loading from '../../../../../components/Loading';

function getIds (features) {
  return features.map(({ _id }) => _id).join(',');
}

export const Header = ({
  loading,
  title,
  resultsTotal,
  toggleExtent,
  extent,
  columns,
  onChange,
  resize,
  full,
  exportData,
  selectedFeatures = [],
  compare = '',
}) => (
  <div
    className={classnames({
      'table-header': true,
      'table-header--is-loading': loading,
    })}
  >
    <div className="table-header__title">
      {title}
      <div className="table-header__counter">
        {loading && (
          <Loading
            className="table-header__loading"
            size={20}
          />
        )}
        <Tag
          className="table-header__count"
          intent={Intent.PRIMARY}
          round
        >
          {resultsTotal} résultat{resultsTotal > 1 ? 's' : ''}
        </Tag>
      </div>
    </div>
    <div className="table-header__actions">
      {exportData && (
        <Popover
          content="Exporter"
          interactionKind={PopoverInteractionKind.HOVER}
        >
          <Button
            onClick={exportData}
            icon="export"
            minimal
            intent={Intent.PRIMARY}
            disabled={!resultsTotal || loading}
          />
        </Popover>
      )}
      {compare && (
        <Popover
          content={
            selectedFeatures.length < 2 || selectedFeatures.length > 3
              ? 'Sélectionnez entre 2 et 3 données pour les comparer'
              : 'Comparer ces données'
          }
          interactionKind={PopoverInteractionKind.HOVER}
        >
          <AnchorButton
            target="_blank"
            href={compare.replace(/\{\{ids\}\}/, getIds(selectedFeatures))}
            icon="comparison"
            minimal
            disabled={selectedFeatures.length < 2 || selectedFeatures.length > 3}
            intent={Intent.PRIMARY}
          />
        </Popover>
      )}
      <Popover
        content={extent ? 'Afficher toutes les données' : 'Filtrer selon l\'emprise de la carte'}
        interactionKind={PopoverInteractionKind.HOVER}
      >
        <Button
          onClick={toggleExtent}
          icon="path-search"
          minimal
          active={extent}
          intent={Intent.PRIMARY}
        />
      </Popover>
      <Popover
        content="Filtrer les propriétés"
        interactionKind={PopoverInteractionKind.HOVER}
      >
        <ColumnsSelector
          columns={columns}
          onChange={onChange}
          position={Position.LEFT}
          locales={{
            displayAllColumns: 'Afficher toutes les colonnes',
            hideAllColumns: 'Cacher toutes les colonnes',
          }}
        />
      </Popover>
      <Popover
        content={full ? 'Réduire' : 'Agrandir'}
        interactionKind={PopoverInteractionKind.HOVER}
      >
        <Button
          onClick={resize}
          icon={full ? 'minimize' : 'maximize'}
          minimal
          active={full}
          intent={Intent.PRIMARY}
        />
      </Popover>
    </div>
  </div>
);

export default Header;
