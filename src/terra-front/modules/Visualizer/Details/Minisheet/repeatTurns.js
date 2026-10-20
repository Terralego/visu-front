import React from 'react';

import formatValue from './formatValue';

const isMissing = value => value === null || value === undefined || value === '';

export const repeatTurns = (block, properties = {}, locale) => (block.fields ?? [])
  .filter(item => item.field && (!isMissing(properties[item.field]) || item.default))
  .map(item => {
    const { text, icon = '', dimmed } = formatValue(
      properties[item.field],
      { format: item.format, default: item.default },
      locale,
    );
    return {
      item,
      properties: {
        ...properties,
        $value: properties[item.field],
        $formatted_value: text,
        $icon: dimmed ? '' : icon,
        $label: item.label ?? '',
        $field: item.field,
      },
    };
  });

export const RepeatTurnContext = React.createContext(null);

export default repeatTurns;
