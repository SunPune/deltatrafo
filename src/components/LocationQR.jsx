import { QRCodeCanvas } from "qrcode.react";

function LocationQR() {
  const location =
    "https://www.google.com/maps/search/?api=1&query=malbhag,A/P-Jambhali,Tal-Shoril,Dist-Kolhapur-416121";

  return (
    <div>
      <QRCodeCanvas
        value={location}
        size={300}
        level="H"
        includeMargin={true}
      />
      <p>Scan for Location</p>
    </div>
  );
}

export default LocationQR;