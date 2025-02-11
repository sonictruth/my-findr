export const exportKML = (reports: DeviceReport[], filename = 'reports') => {
  const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>`;
  const kmlFooter = `</Document></kml>`;

  const kmlBody = reports
    .map((report) => {
      const long = report.decrypedPayload.location.longitude;
      const lat = report.decrypedPayload.location.latitude;
      const timeAndDate = report.decrypedPayload.date;

      return `
        <Placemark>
            <TimeStamp>
                <when>${timeAndDate.toISOString()}</when>
            </TimeStamp>
            <Point>
                <coordinates>${long},${lat}</coordinates>
            </Point>
        </Placemark>`;
    })
    .join('');

  const kmlContent = kmlHeader + kmlBody + kmlFooter;

  const blob = new Blob([kmlContent], {
    type: 'application/vnd.google-earth.kml+xml',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.kml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
