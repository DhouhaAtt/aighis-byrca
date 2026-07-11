import Link from "next/link";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import legalStyles from "../components/LegalPage/LegalPage.module.css";

export default function LegalPage() {
  return (
    <div className={legalStyles.page}>
      <Navbar compact />
      <section style={{background:"#111", color:"white", padding:"140px 40px 50px", textAlign:"center"}}>
        <h1 style={{fontFamily:"var(--font-logo)", fontSize:"2.6rem", fontWeight:400, lineHeight:1.15}}>
          Mentions Légales
        </h1>
        <p style={{marginTop:8, fontSize:".9rem", fontWeight:300, opacity:.6, letterSpacing:".04em"}}>
          Legal Notice
        </p>
      </section>
      <section className={legalStyles.content}>
        <p className={legalStyles.lastUpdated}>
          Dernière mise à jour / Last updated: July 2026
        </p>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>1. Éditeur du site / Publisher</h2>
          <p>
            <strong>Aighis Byrca</strong><br />
            Société à responsabilité limitée (SARL) au capital de 50 000 TND<br />
            Registre de Commerce : Tunis XXXX XXXX<br />
            Matricule Fiscal : XXXXXX/X/X/X<br />
            Siège social : Tunis, Tunisie<br />
            Email : contact@aighisbyrca.com<br />
            Téléphone : +216 XX XXX XXX
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>2. Directeur de publication / Publishing Director</h2>
          <p>Le Directeur de la publication est la personne morale représentant Aighis Byrca.</p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>3. Hébergement / Hosting</h2>
          <p>
            Ce site est hébergé par Vercel Inc.<br />
            440 N Barranca Ave #4133, Covina, CA 91723, USA<br />
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className={legalStyles.link}>vercel.com</a>
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>4. Propriété intellectuelle / Intellectual Property</h2>
          <p>
            L&apos;ensemble du contenu du site aighisbyrca.com (textes, images, vidéos, logos, marques, designs)
            est la propriété exclusive d&apos;Aighis Byrca. Toute reproduction, distribution ou utilisation sans
            autorisation écrite préalable est interdite conformément à la Loi tunisienne n° 2001-36 relative à
            la protection de la propriété littéraire et artistique.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>5. Données personnelles / Personal Data</h2>
          <p>
            Conformément à la Loi organique n° 2004-63 du 27 juillet 2004 relative à la protection des
            données à caractère personnel, vous disposez d&apos;un droit d&apos;accès, de rectification et
            de suppression de vos données. Pour exercer ces droits, contactez-nous à contact@aighisbyrca.com.
          </p>
          <p>
            Consultez notre <Link href="/privacy-policy" className={legalStyles.link}>Politique de Confidentialité</Link> pour plus d&apos;informations.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>6. Conditions générales / Terms</h2>
          <p>
            La vente de nos produits est régie par nos <Link href="/terms" className={legalStyles.link}>Conditions Générales de Vente</Link>.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
