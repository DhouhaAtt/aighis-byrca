import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import legalStyles from "../components/LegalPage/LegalPage.module.css";

export default function PrivacyPage() {
  return (
    <div className={legalStyles.page}>
      <Navbar compact />
      <section className={legalStyles.header}>
        <h1>
          Politique de Confidentialité
        </h1>
        <p>
          Privacy Policy
        </p>
      </section>
      <section className={legalStyles.content}>
        <p className={legalStyles.lastUpdated}>
          Dernière mise à jour / Last updated: July 2026
        </p>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>1. Collecte des données / Data Collection</h2>
          <p>
            Dans le cadre de vos commandes et de votre navigation sur aighisbyrca.com, nous pouvons
            collecter les informations suivantes : nom, prénom, adresse email, adresse de livraison,
            numéro de téléphone, et préférences de navigation.
          </p>
          <p>
            Ces données sont collectées uniquement dans le but de traiter vos commandes, vous livrer
            vos produits et améliorer votre expérience sur notre site.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>2. Base légale / Legal Basis</h2>
          <p>
            Le traitement de vos données repose sur l&apos;exécution du contrat de vente
            (traitement des commandes, livraison, facturation) et sur votre consentement
            (inscription à la newsletter, cookies de navigation) conformément à la Loi
            organique n° 2004-63 du 27 juillet 2004 relative à la protection des données
            à caractère personnel.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>3. Partage des données / Data Sharing</h2>
          <p>
            Vos données personnelles ne sont jamais vendues à des tiers. Elles peuvent être
            communiquées à nos partenaires de livraison et de paiement dans le strict cadre
            du traitement de votre commande, et uniquement dans la mesure nécessaire à
            l&apos;exécution de celle-ci.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>4. Cookies</h2>
          <p>
            Notre site utilise des cookies essentiels au fonctionnement du panier et de la
            navigation. Des cookies analytiques peuvent être utilisés pour améliorer notre
            service. Vous pouvez gérer vos préférences de cookies dans les paramètres de
            votre navigateur.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>5. Durée de conservation / Retention</h2>
          <p>
            Vos données sont conservées pendant la durée nécessaire au traitement de votre
            commande et pendant les délais légaux de garantie et de prescription fiscale
            (5 ans pour les données comptables et fiscales).
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>6. Vos droits / Your Rights</h2>
          <p>
            Conformément à la Loi tunisienne n° 2004-63, vous disposez des droits suivants :
          </p>
          <ul>
            <li>Droit d&apos;accès à vos données personnelles</li>
            <li>Droit de rectification des données inexactes</li>
            <li>Droit à la suppression de vos données (« droit à l&apos;oubli »)</li>
            <li>Droit d&apos;opposition au traitement de vos données</li>
            <li>Droit à la portabilité de vos données</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à : <strong>contact@aighisbyrca.com</strong>.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>7. Sécurité / Security</h2>
          <p>
            Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées
            pour protéger vos données personnelles contre tout accès non autorisé, modification,
            divulgation ou destruction.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
