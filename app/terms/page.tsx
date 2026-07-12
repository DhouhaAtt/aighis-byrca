import Link from "next/link";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import legalStyles from "../components/LegalPage/LegalPage.module.css";

export default function TermsPage() {
  return (
    <div className={legalStyles.page}>
      <Navbar compact />
      <section className={legalStyles.header}>
        <h1>
          Conditions Générales de Vente
        </h1>
        <p>
          Terms &amp; Conditions of Sale
        </p>
      </section>
      <section className={legalStyles.content}>
        <p className={legalStyles.lastUpdated}>
          Dernière mise à jour / Last updated: July 2026
        </p>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>1. Champ d&apos;application / Scope</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent l&apos;ensemble des transactions
            réalisées sur le site aighisbyrca.com entre Aighis Byrca et tout client consommateur.
            La passation d&apos;une commande implique l&apos;acceptation sans réserve des présentes CGV.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>2. Produits / Products</h2>
          <p>
            Les produits proposés à la vente sont décrits avec précision sur le site. Les photographies
            sont fournies à titre indicatif et ne sont pas contractuelles. Aighis Byrca s&apos;engage à
            livrer des produits conformes à la description publiée au moment de la commande.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>3. Prix / Prices</h2>
          <p>
            Tous les prix sont indiqués en Dinar Tunisien (TND) et incluent la TVA au taux en vigueur
            en Tunisie. Les frais de livraison sont précisés avant la validation de la commande et
            peuvent varier selon la destination et le mode de livraison choisi.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>4. Commande / Order</h2>
          <p>
            La commande est validée après confirmation du paiement. Un email de confirmation est envoyé
            à l&apos;adresse renseignée par le client. Aighis Byrca se réserve le droit d&apos;annuler
            toute commande en cas de litige antérieur, d&apos;indisponibilité du produit ou d&apos;erreur
            manifeste sur le prix.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>5. Paiement / Payment</h2>
          <p>
            Les moyens de paiement acceptés sont : le paiement à la livraison, le virement bancaire,
            et la carte D17. Le débit est effectué au moment de la confirmation de la commande.
            Conformément à la législation tunisienne, toutes les transactions sont sécurisées.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>6. Livraison / Delivery</h2>
          <p>
            La livraison est effectuée à l&apos;adresse indiquée par le client dans un délai de
            3 à 7 jours ouvrés pour la Tunisie. Aighis Byrca ne peut être tenu responsable des
            retards de livraison indépendants de sa volonté. En cas de produit manquant ou
            endommagé, le client doit en informer le service client dans les 48 heures suivant
            la réception.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>7. Droit de rétractation / Right of Withdrawal</h2>
          <p>
            Conformément à la Loi tunisienne n° 2018-20 du 17 avril 2018 relative aux transactions
            électroniques, le client dispose d&apos;un délai de 14 jours à compter de la réception
            du produit pour exercer son droit de rétractation, sans motif et sans pénalité.
          </p>
          <p>
            Les articles retournés doivent être dans leur état d&apos;origine, non portés, non lavés,
            avec toutes leurs étiquettes. Les frais de retour sont à la charge du client, sauf en
            cas de produit défectueux ou d&apos;erreur de notre part.
          </p>
          <p>
            Voir notre <Link href="/returns" className={legalStyles.link}>Politique de Retour</Link> pour plus de détails.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>8. Garantie / Warranty</h2>
          <p>
            Tous nos produits bénéficient de la garantie légale de conformité prévue par le Code
            de la Consommation tunisien (Loi n° 92-117 du 7 décembre 1992). En cas de défaut de
            conformité, le client peut demander le remplacement ou le remboursement du produit.
          </p>
        </div>

        <div className={legalStyles.section}>
          <h2 className={legalStyles.sectionTitle}>9. Litiges / Disputes</h2>
          <p>
            Les présentes CGV sont soumises à la loi tunisienne. En cas de litige, le client peut
            contacter le service client à contact@aighisbyrca.com. À défaut de résolution amiable,
            les tribunaux de Tunis sont seuls compétents.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
