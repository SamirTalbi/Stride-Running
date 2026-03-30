export type Carrier = {
  id: string;
  name: string;
  logo: string; // emoji ou initiales
  trackingUrl: (trackingNumber: string) => string;
  color: string;
};

export const CARRIERS: Carrier[] = [
  {
    id: "colissimo",
    name: "Colissimo",
    logo: "🟡",
    trackingUrl: (n) => `https://www.laposte.fr/outils/suivre-vos-envois?code=${n}`,
    color: "#FFD700",
  },
  {
    id: "chronopost",
    name: "Chronopost",
    logo: "🔵",
    trackingUrl: (n) => `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${n}`,
    color: "#0033A0",
  },
  {
    id: "dhl",
    name: "DHL",
    logo: "🟥",
    trackingUrl: (n) => `https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=${n}`,
    color: "#D40511",
  },
  {
    id: "ups",
    name: "UPS",
    logo: "🟤",
    trackingUrl: (n) => `https://www.ups.com/track?loc=fr_FR&tracknum=${n}`,
    color: "#351C15",
  },
  {
    id: "fedex",
    name: "FedEx",
    logo: "🟣",
    trackingUrl: (n) => `https://www.fedex.com/apps/fedextrack/?tracknumbers=${n}&locale=fr_FR`,
    color: "#4D148C",
  },
  {
    id: "dpd",
    name: "DPD",
    logo: "🔴",
    trackingUrl: (n) => `https://www.dpd.fr/apps/tracking/?reference=${n}`,
    color: "#DC0032",
  },
  {
    id: "gls",
    name: "GLS",
    logo: "🟠",
    trackingUrl: (n) => `https://gls-group.com/track/${n}`,
    color: "#FF6600",
  },
  {
    id: "mondialrelay",
    name: "Mondial Relay",
    logo: "🟢",
    trackingUrl: (n) => `https://www.mondialrelay.fr/suivi-de-colis/?NumeroExpedition=${n}`,
    color: "#00B140",
  },
  {
    id: "tnt",
    name: "TNT",
    logo: "🟧",
    trackingUrl: (n) => `https://www.tnt.com/express/fr_fr/site/outils-expedition/suivi.html?searchType=CON&cons=${n}`,
    color: "#FF6600",
  },
  {
    id: "colisprive",
    name: "Colis Privé",
    logo: "⚫",
    trackingUrl: (n) => `https://www.colisprive.fr/moncolis/pages/detailColis.aspx?numColis=${n}`,
    color: "#1A1A1A",
  },
  {
    id: "bpost",
    name: "bpost",
    logo: "🟡",
    trackingUrl: (n) => `https://track.bpost.cloud/btr/web/#/search?itemCode=${n}`,
    color: "#FFD700",
  },
  {
    id: "yunexpress",
    name: "Yunexpress",
    logo: "🇨🇳",
    trackingUrl: (n) => `https://www.yuntrack.com/parcelTracking?num=${n}`,
    color: "#E53E3E",
  },
  {
    id: "4px",
    name: "4PX",
    logo: "🇨🇳",
    trackingUrl: (n) => `https://track.4px.com/#/result/0/${n}`,
    color: "#2B6CB0",
  },
  {
    id: "cainiao",
    name: "Cainiao",
    logo: "🇨🇳",
    trackingUrl: (n) => `https://global.cainiao.com/detail.htm?mailNoList=${n}`,
    color: "#FF6A00",
  },
  {
    id: "other",
    name: "Autre transporteur",
    logo: "📦",
    trackingUrl: (n) => n,
    color: "#6B7280",
  },
];

export function getCarrier(id: string): Carrier | undefined {
  return CARRIERS.find((c) => c.id === id);
}

export function buildTrackingUrl(carrierId: string, trackingNumber: string, customUrl?: string): string {
  if (carrierId === "other" && customUrl) return customUrl;
  const carrier = getCarrier(carrierId);
  return carrier ? carrier.trackingUrl(trackingNumber) : trackingNumber;
}
