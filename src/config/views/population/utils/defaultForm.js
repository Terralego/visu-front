import { TYPE_SINGLE } from '@terralego/core/modules/Forms/Filters/Filters';

export default [
  {
    property: 'nom',
    label: 'Nom',
    type: TYPE_SINGLE,
    fetchValues: true,
  }, {
    property: 'codegeo',
    label: 'Code INSEE',
    type: TYPE_SINGLE,
    fetchValues: true,
  }, {
    property: 'libepci',
    label: 'Intercommune',
    type: TYPE_SINGLE,
    fetchValues: true,
  }, {
    property: 'libdep',
    label: 'Département',
    type: TYPE_SINGLE,
    fetchValues: true,
  }, {
    property: 'libreg',
    label: 'Région',
    type: TYPE_SINGLE,
    fetchValues: true,
  },
];
