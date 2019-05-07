export const cadastre = {
  id: 'cadastre',
  type: 'raster',
  minzoom: 14,
  source: {
    type: 'raster',
    tiles: [
      'https://wxs.ign.fr/ykxi4rb4nf5hb7i4okoc5dtt/geoportail/wmts?LAYER=CADASTRALPARCELS.PARCELS&EXCEPTIONS=text/xml&FORMAT=image/png&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=bdparcellaire_o&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
    ],
    tileSize: 256,
  },
};

export default cadastre;
