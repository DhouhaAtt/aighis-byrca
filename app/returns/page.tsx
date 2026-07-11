import Link from "next/link";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import legalStyles from "../components/LegalPage/LegalPage.module.css";

export default function ReturnsPage() {
  return (
    <div className={legalStyles.page}>
      <Navbar compact />
      <section style={{background:"#111", color:"white", padding:"140px 40px 50px", textAlign:"center"}}>
        <h1 style={{fontFamily:"var(--font-logo)", fontSize:"2.6rem", fontWeight:400, lineHeight:1.15}}>
          Politique de Retour
        </h1>
        <p style={{marginTop:8, fontSize:".9rem", fontWeight:300, opacity:.6, letterSpacing:".04em"}}>
          Returns &amp; Refunds Policy
        </p>
      </section>
      <section className={legalStyles.content}>
        <p className={legalStyles.lastUpdated}>
          Dernière mise à jour / Last updated: July 2026
        </p>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>1. Délai de rétractation / Withdrawal Period</h2>
          <p>
            Conformément à la Loi tunisienne n° 2018-20 relative aux transactions électroniques,
            vous disposez d&apos;un délai de <strong>14 jours</strong> à compter de la réception
            de votre commande pour retourner un article sans avoir à justifier de motifs ni à
            payer de pénalité.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>2. Conditions de retour / Return Conditions</h2>
          <p>Pour être accepté, tout retour doit respecter les conditions suivantes :</p>
          <ul>
            <li>L&apos;article doit être dans son état d&apos;origine, non porté et non lavé</li>
            <li>Toutes les étiquettes et le packaging d&apos;origine doivent être intacts</li>
            <li>L&apos;article doit être retourné dans son emballage d&apos;origine</li>
            <li>Les articles en soldes ou en promotion finale ne sont pas échangeables</li>
            <li>Les articles de lingerie et de maillots de bain ne peuvent être retournés pour des raisons d&apos;hygiène</li>
          </ul>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>3. Procédure de retour / Return Procedure</h2>
          <p>Pour effectuer un retour :</p>
          <ul>
            <li>Contactez notre service client à <strong>contact@aighisbyrca.com</strong></li>
            <li>Indiquez votre numéro de commande et le ou les articles concernés</li>
            <li>Vous recevrez un email de confirmation avec les instructions de retour</li>
            <li>Emballez soigneusement l&apos;article et joignez le bon de retour</li>
            <li>Expédiez le colis à l&apos;adresse qui vous sera communiquée</li>
          </ul>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>4. Frais de retour / Return Costs</h2>
          <p>
            Les frais de retour sont à la charge du client, sauf dans les cas suivants :
          </p>
          <ul>
            <li>Article défectueux ou non conforme à la commande (frais pris en charge par Aighis Byrca)</li>
            <li>Erreur de notre part dans la préparation de la commande</li>
          </ul>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>5. Remboursement / Refunds</h2>
          <p>
            Le remboursement est effectué sous <strong>14 jours</strong> suivant la réception et
            la vérification de l&apos;article retourné. Le remboursement est effectué via le même
            moyen de paiement utilisé lors de la commande. Les frais de livraison initiaux ne sont
            pas remboursés, sauf en cas d&apos;erreur de notre part.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>6. Échanges / Exchanges</h2>
          <p>
            Pour échanger un article (taille ou couleur différente), veuillez suivre la procédure
            de retour et passer une nouvelle commande pour l&apos;article souhaité. Cela garantit
            un traitement plus rapide de votre demande.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>7. Contact</h2>
          <p>
            Pour toute question concernant les retours, contactez-nous à :
            <strong> contact@aighisbyrca.com</strong>
          </p>
          <p>
            Consultez également nos <Link href="/terms" className={legalStyles.link}>Conditions Générales de Vente</Link>.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
