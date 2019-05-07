import layers from '../common/customStyle';

export default {
  sources: [{
    id: 'terralego',
    type: 'vector',
    url: '{{HOST}}/layer/reference/tilejson',
  }],
  layers: [
    layers.layerEaeDom,
    layers.layerEaeRegr,
    layers.layerEaeSurf,
    layers.layerEpciEAELessThan10ha,
    layers.layerEpciEAEEmployees,
    layers.layerEpciEAEAVGSurface,
    layers.layerEpciEAEAVGEmployees,
    layers.layerEaeEmployment,
    layers.layerEpciEmploymentDensity,
    layers.layerEaeCentroidPoint,
    layers.layerRoadsBis,
    layers.layerRoadTransportBis,
    layers.layerEaeGreenActivities,
    layers.layerEaeIsoVocLogistique30,
    layers.layerEaeIsoVocLogistique25,
    layers.layerEaeIsoVocLogistique20,
    layers.layerEaeIsoVocLogistique15,
    layers.layerEaeIsoVocLogistique10,
    layers.layerEaeIsoVocLogistique5,
    layers.layerEaeLogistique,
    layers.layerEstablishmentEmployees,
    layers.LayerGareTime45,
    layers.LayerGareTime30,
    layers.LayerGareTime15,

    layers.layerPemTransport,
    layers.layerEstablishment,
  ],
};
