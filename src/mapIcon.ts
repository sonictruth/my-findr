import L from 'leaflet';
import icon from  './assets/marker-icon.png?inline'
import iconShadow from './assets/marker-shadow.png?inline'

const mapIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    tooltipAnchor: [12, 0],
});
export { mapIcon };
