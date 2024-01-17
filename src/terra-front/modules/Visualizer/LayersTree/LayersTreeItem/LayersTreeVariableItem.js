import { Callout, Collapse } from '@blueprintjs/core';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LayersTreeItem from '.';
import Select from '../../../Forms/Controls/Select';
import context from '../LayersTreeProvider/context';

const getSelectedLayer = (selectedVariables, layers) =>
  layers.find(layer =>
    Object.entries(selectedVariables).every(
      ([variable, value]) => layer.variables?.[variable] === value,
    ));

const getValuesByVariable = (variables, layers) => {
  const values = {};
  variables.forEach(variable => {
    values[variable.id] = Array.from(
      new Set(layers.map(layer => layer.variables?.[variable.id])),
    ).sort();
  });
  return values;
};

const LayersTreeVariableItem = ({ group, layers, activeLayer }) => {
  const { t } = useTranslation();

  const { variables } = group;

  const [selectedVariables, setSelectedVariables] = React.useState(
    layers[0].variables || {},
  );


  const [layer, setLayer] = useState(
    getSelectedLayer(selectedVariables, layers),
  );
  const [error, setError] = useState(null);

  const { setLayerState, getLayerState, layersExtent, isDetailsVisible } = useContext(context);

  const valuesByVariable = getValuesByVariable(variables, layers);

  useEffect(() => {
    if (!activeLayer) return;
    setLayer(activeLayer);
    setSelectedVariables(activeLayer.variables);
    setLayerState({ layer: activeLayer, state: { active: true } });
  }, [activeLayer, setLayerState]);

  const handleChange = (variable, value) => {
    const newSelectedVariables = { ...selectedVariables, [variable]: value };
    const newLayer = getSelectedLayer(newSelectedVariables, layers);
    setSelectedVariables(newSelectedVariables);
    if (!newLayer) {
      setError(t('terralego.visualizer.layerstree.variableLayers.error'));
      return;
    }
    setError(null);
    setLayerState({ layer, state: { active: false } });
    setLayerState({ layer: newLayer, state: { active: true } });
    setLayer(newLayer);
  };

  const layerActive = getLayerState({ layer }).active;

  return (
    <>
      <div className="layerstree-group layerstree-group--active">
        {layer && (
          <LayersTreeItem
            key={layer.label}
            layer={layer}
            customLabel={
              layerActive
                ? `${group.group} (${variables.map(({ id }) => layer.variables[id]).join(' - ')})`
                : group.group
            }
            extent={layersExtent?.[layer.label]}
            isDetailsVisible={isDetailsVisible}
          />
        )}
        <Collapse isOpen={layerActive}>
          <div style={{ padding: 5, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {error && <Callout intent="danger">{error}</Callout>}
            {variables.map(variable => (
              <Select
                fullWidth
                value={selectedVariables[variable.id]}
                onChange={value => handleChange(variable.id, value)}
                values={valuesByVariable[variable.id]}
              />
            ))}
          </div>
        </Collapse>
      </div>
    </>
  );
};

export default LayersTreeVariableItem;
