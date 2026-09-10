/* Regenerate the no-JavaScript globe using the same local data and projection. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({});
for (const filename of ['d3-array.min.js', 'd3-geo.min.js', 'topojson-client.min.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/vendor', filename), 'utf8'), context);
}
const topology = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/world-110m.json'), 'utf8'));
const { d3, topojson } = context;
const countries = topojson.feature(topology, topology.objects.countries);
const projection = d3.geoOrthographic().rotate([-75, -35]).translate([400, 400]).scale(356).precision(.3);
const geoPath = d3.geoPath(projection);
const css = fs.readFileSync(path.join(root, 'assets/css/design-system.css'), 'utf8');
const colour = key => css.match(new RegExp('--' + key + ':\\s*([^;]+);'))[1].trim();
const draw = (geometry, attributes) => `<path d="${geoPath(geometry)}" ${attributes}/>`;
const cities = [
  { name: 'Shanghai', point: [121.4737, 31.2304], country: '156' },
  { name: 'Bangkok', point: [100.5018, 13.7563], country: '764' },
  { name: 'Helsinki', point: [24.9384, 60.1699], country: '246' }
];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
<title>Shanghai, Bangkok and Helsinki</title>
<desc>Orthographic globe with Natural Earth country outlines. City cards are available below the map.</desc>
${draw({type:'Sphere'}, `fill="${colour('earth-ocean')}"`)}
${draw(countries, `fill="${colour('earth-land')}"`)}
${cities.map(city => draw(countries.features.find(f => f.id === city.country), `fill="${colour('earth-country')}"`)).join('\n')}
${draw(d3.geoGraticule10(), `fill="none" stroke="${colour('earth-grid')}" stroke-width=".6"`)}
${draw(topojson.mesh(topology, topology.objects.countries), `fill="none" stroke="${colour('earth-border')}" stroke-width=".7"`)}
${draw({type:'Sphere'}, `fill="none" stroke="${colour('earth-grid')}"`)}
${cities.map(city => {
  const [x,y] = projection(city.point);
  return `<circle cx="${x}" cy="${y}" r="4" fill="${colour('signal')}"/>
  <text x="${x+12}" y="${y+5}" font-size="15" font-family="monospace" fill="${colour('ink')}">${city.name}</text>`;
}).join('\n')}
</svg>\n`;
fs.writeFileSync(path.join(root, 'assets/img/earth-overview.svg'), svg);
console.log('Built assets/img/earth-overview.svg from local Natural Earth data.');
