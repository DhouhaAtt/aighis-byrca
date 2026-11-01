"use client";

import Link from "next/link";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { useLocale } from "../../context/LocaleContext";
import styles from "./LegalPage.module.css";

type DocumentKey = "legal" | "privacy" | "returns" | "terms";
type Section = { title: string; paragraphs?: string[]; bullets?: string[]; link?: { before: string; label: string; after: string; href: string } };
type Copy = { title: string; updated: string; sections: Section[] };

const documents: Record<"en" | "fr", Record<DocumentKey, Copy>> = {
  en: {
    legal: {
      title: "Legal Notice", updated: "Last updated: July 2026",
      sections: [
        { title: "1. Publisher", paragraphs: ["Aighis Byrca", "Limited liability company (SARL) with share capital of 50,000 TND", "Commercial Register: Tunis XXXX XXXX", "Tax ID: XXXXXX/X/X/X", "Registered office: Tunis, Tunisia", "Email: aighisbyrca@gmail.com", "Phone: +216 XX XXX XXX"] },
        { title: "2. Publishing Director", paragraphs: ["The publishing director is the legal entity representing Aighis Byrca."] },
        { title: "3. Hosting", paragraphs: ["This website is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA."] },
        { title: "4. Intellectual Property", paragraphs: ["All content on aighisbyrca.com, including text, images, videos, logos, trademarks and designs, is the exclusive property of Aighis Byrca. Reproduction, distribution or use without prior written permission is prohibited under Tunisian Law No. 2001-36 on the protection of literary and artistic property."] },
        { title: "5. Personal Data", paragraphs: ["Under Organic Law No. 2004-63 of 27 July 2004 on the protection of personal data, you may request access to, correction of or deletion of your data. Contact aighisbyrca@gmail.com to exercise these rights."], link: { before: "Read our ", label: "Privacy Policy", after: " for more information.", href: "/privacy-policy" } },
        { title: "6. Terms of Sale", paragraphs: ["Sales of our products are governed by our Terms and Conditions of Sale."], link: { before: "See our ", label: "Terms and Conditions of Sale", after: ".", href: "/terms" } },
      ],
    },
    privacy: {
      title: "Privacy Policy", updated: "Last updated: July 2026",
      sections: [
        { title: "1. Data Collection", paragraphs: ["When you place an order or browse aighisbyrca.com, we may collect your name, email address, delivery address, phone number and browsing preferences.", "We collect this data only to process and deliver orders and improve your experience on our website."] },
        { title: "2. Legal Basis", paragraphs: ["We process data to perform the sales contract (including order processing, delivery and invoicing) and, where applicable, with your consent (such as newsletter requests and browsing cookies), in accordance with Tunisian Organic Law No. 2004-63 of 27 July 2004 on personal data protection."] },
        { title: "3. Data Sharing", paragraphs: ["We never sell personal data. We may share it with delivery and payment partners only as needed to process your order."] },
        { title: "4. Cookies", paragraphs: ["Essential cookies support the shopping bag and site navigation. Analytics cookies may be used to improve our service. You can manage cookie settings in your browser."] },
        { title: "5. Retention", paragraphs: ["We keep data for as long as needed to process your order and for applicable warranty and tax limitation periods (five years for accounting and tax records)."] },
        { title: "6. Your Rights", paragraphs: ["Under Tunisian Law No. 2004-63, you may exercise the following rights:"], bullets: ["Access your personal data", "Correct inaccurate data", "Request deletion of your data", "Object to data processing", "Request data portability"], link: { before: "To exercise these rights, contact ", label: "aighisbyrca@gmail.com", after: ".", href: "mailto:aighisbyrca@gmail.com" } },
        { title: "7. Security", paragraphs: ["We use appropriate technical and organisational measures to protect personal data against unauthorised access, alteration, disclosure or destruction."] },
      ],
    },
    returns: {
      title: "Returns and Refunds Policy", updated: "Last updated: July 2026",
      sections: [
        { title: "1. Withdrawal Period", paragraphs: ["Under Tunisian Law No. 2018-20 on electronic transactions, you have 14 days from receipt of your order to return an item without giving a reason or paying a penalty."] },
        { title: "2. Return Conditions", paragraphs: ["Returned items must meet all of these conditions:"], bullets: ["Be in their original condition, unworn and unwashed", "Have all original labels and packaging intact", "Be returned in their original packaging", "Final-sale items cannot be exchanged", "Lingerie and swimwear cannot be returned for hygiene reasons"] },
        { title: "3. Return Procedure", paragraphs: ["To make a return:"], bullets: ["Email aighisbyrca@gmail.com", "Include your order number and the item or items concerned", "Wait for a confirmation email with return instructions", "Pack the item carefully and include the return slip", "Ship the parcel to the address provided to you"] },
        { title: "4. Return Costs", paragraphs: ["The customer pays return costs, except when an item is defective or does not match the order, or when we made a fulfilment error. In those cases, Aighis Byrca covers the return costs."] },
        { title: "5. Refunds", paragraphs: ["Refunds are issued within 14 days after we receive and inspect the returned item. We refund the original payment method. Initial delivery costs are not refunded unless the error was ours."] },
        { title: "6. Exchanges", paragraphs: ["To exchange an item for another size or colour, follow the return procedure and place a new order for the item you want. This helps us process your request faster."] },
        { title: "7. Contact", paragraphs: ["For return questions, email aighisbyrca@gmail.com."], link: { before: "You can also read our ", label: "Terms and Conditions of Sale", after: ".", href: "/terms" } },
      ],
    },
    terms: {
      title: "Terms and Conditions of Sale", updated: "Last updated: July 2026",
      sections: [
        { title: "1. Scope", paragraphs: ["These Terms and Conditions of Sale govern transactions on aighisbyrca.com between Aighis Byrca and consumer customers. Placing an order means you accept these terms without reservation."] },
        { title: "2. Products", paragraphs: ["Products are described as accurately as possible. Photographs are illustrative and are not contractual. Aighis Byrca undertakes to deliver products that match the description published when the order was placed."] },
        { title: "3. Prices", paragraphs: ["Prices are shown in Tunisian dinars (TND) and include VAT at the applicable rate in Tunisia. Delivery charges are shown before checkout and may vary by destination and delivery method."] },
        { title: "4. Orders", paragraphs: ["An order is confirmed after payment confirmation. A confirmation email is sent to the address provided by the customer. Aighis Byrca may cancel an order in the event of a prior dispute, product unavailability or an obvious pricing error."] },
        { title: "5. Payment", paragraphs: ["Accepted payment methods are cash on delivery, bank transfer and D17. Payment is collected when the order is confirmed. Transactions are secured in accordance with Tunisian law."] },
        { title: "6. Delivery", paragraphs: ["Delivery is made to the address provided by the customer, generally within 3 to 7 business days in Tunisia. Aighis Byrca is not responsible for delays beyond its control. The customer must report missing or damaged products within 48 hours of receipt."] },
        { title: "7. Right of Withdrawal", paragraphs: ["Under Tunisian Law No. 2018-20 of 17 April 2018 on electronic transactions, customers have 14 days from receipt to withdraw without giving a reason or paying a penalty.", "Returned items must be unworn and unwashed, in their original condition and with all labels attached. The customer pays return costs unless the item is defective or we made an error."], link: { before: "See our ", label: "Returns Policy", after: " for details.", href: "/returns" } },
        { title: "8. Warranty", paragraphs: ["Products are covered by the statutory conformity warranty under the Tunisian Consumer Protection Code (Law No. 92-117 of 7 December 1992). If a product does not conform, the customer may request a replacement or refund."] },
        { title: "9. Disputes", paragraphs: ["These terms are governed by Tunisian law. For disputes, contact customer service at aighisbyrca@gmail.com. If an amicable resolution cannot be reached, the courts of Tunis have jurisdiction."] },
      ],
    },
  },
  fr: {
    legal: {
      title: "Mentions légales", updated: "Dernière mise à jour : juillet 2026",
      sections: [
        { title: "1. Éditeur du site", paragraphs: ["Aighis Byrca", "Société à responsabilité limitée (SARL) au capital de 50 000 TND", "Registre de commerce : Tunis XXXX XXXX", "Matricule fiscal : XXXXXX/X/X/X", "Siège social : Tunis, Tunisie", "E-mail : aighisbyrca@gmail.com", "Téléphone : +216 XX XXX XXX"] },
        { title: "2. Directeur de publication", paragraphs: ["Le directeur de la publication est la personne morale représentant Aighis Byrca."] },
        { title: "3. Hébergement", paragraphs: ["Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis."] },
        { title: "4. Propriété intellectuelle", paragraphs: ["L’ensemble du contenu du site aighisbyrca.com (textes, images, vidéos, logos, marques et designs) est la propriété exclusive d’Aighis Byrca. Toute reproduction, distribution ou utilisation sans autorisation écrite préalable est interdite conformément à la Loi tunisienne n° 2001-36 relative à la protection de la propriété littéraire et artistique."] },
        { title: "5. Données personnelles", paragraphs: ["Conformément à la Loi organique n° 2004-63 du 27 juillet 2004 relative à la protection des données personnelles, vous pouvez demander l’accès à vos données, leur rectification ou leur suppression. Pour exercer ces droits, contactez aighisbyrca@gmail.com."], link: { before: "Consultez notre ", label: "Politique de confidentialité", after: " pour en savoir plus.", href: "/privacy-policy" } },
        { title: "6. Conditions de vente", paragraphs: ["La vente de nos produits est régie par nos Conditions générales de vente."], link: { before: "Consultez nos ", label: "Conditions générales de vente", after: ".", href: "/terms" } },
      ],
    },
    privacy: {
      title: "Politique de confidentialité", updated: "Dernière mise à jour : juillet 2026",
      sections: [
        { title: "1. Collecte des données", paragraphs: ["Dans le cadre de vos commandes et de votre navigation sur aighisbyrca.com, nous pouvons collecter votre nom, votre adresse e-mail, votre adresse de livraison, votre numéro de téléphone et vos préférences de navigation.", "Ces données sont collectées uniquement pour traiter et livrer vos commandes et améliorer votre expérience sur notre site."] },
        { title: "2. Base légale", paragraphs: ["Le traitement de vos données repose sur l’exécution du contrat de vente (traitement des commandes, livraison et facturation) et, le cas échéant, sur votre consentement (demandes d’inscription à la newsletter et cookies de navigation), conformément à la Loi organique tunisienne n° 2004-63 du 27 juillet 2004 relative à la protection des données personnelles."] },
        { title: "3. Partage des données", paragraphs: ["Vos données personnelles ne sont jamais vendues. Elles peuvent être communiquées à nos partenaires de livraison et de paiement uniquement dans la mesure nécessaire au traitement de votre commande."] },
        { title: "4. Cookies", paragraphs: ["Des cookies essentiels assurent le fonctionnement du panier et de la navigation. Des cookies analytiques peuvent être utilisés pour améliorer notre service. Vous pouvez gérer vos préférences dans les paramètres de votre navigateur."] },
        { title: "5. Durée de conservation", paragraphs: ["Vos données sont conservées pendant la durée nécessaire au traitement de votre commande et pendant les délais légaux de garantie et de prescription fiscale (cinq ans pour les données comptables et fiscales)."] },
        { title: "6. Vos droits", paragraphs: ["Conformément à la Loi tunisienne n° 2004-63, vous disposez des droits suivants :"], bullets: ["Accéder à vos données personnelles", "Rectifier les données inexactes", "Demander la suppression de vos données", "Vous opposer au traitement de vos données", "Demander la portabilité de vos données"], link: { before: "Pour exercer ces droits, contactez ", label: "aighisbyrca@gmail.com", after: ".", href: "mailto:aighisbyrca@gmail.com" } },
        { title: "7. Sécurité", paragraphs: ["Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, toute modification, divulgation ou destruction."] },
      ],
    },
    returns: {
      title: "Politique de retour", updated: "Dernière mise à jour : juillet 2026",
      sections: [
        { title: "1. Délai de rétractation", paragraphs: ["Conformément à la Loi tunisienne n° 2018-20 relative aux transactions électroniques, vous disposez de 14 jours à compter de la réception de votre commande pour retourner un article sans motif ni pénalité."] },
        { title: "2. Conditions de retour", paragraphs: ["Tout retour doit respecter les conditions suivantes :"], bullets: ["L’article doit être dans son état d’origine, non porté et non lavé", "Toutes les étiquettes et l’emballage d’origine doivent être intacts", "L’article doit être retourné dans son emballage d’origine", "Les articles en vente finale ne sont pas échangeables", "Les articles de lingerie et les maillots de bain ne peuvent pas être retournés pour des raisons d’hygiène"] },
        { title: "3. Procédure de retour", paragraphs: ["Pour effectuer un retour :"], bullets: ["Contactez notre service client à aighisbyrca@gmail.com", "Indiquez votre numéro de commande et les articles concernés", "Attendez l’e-mail de confirmation contenant les instructions", "Emballez soigneusement l’article et joignez le bon de retour", "Expédiez le colis à l’adresse qui vous sera communiquée"] },
        { title: "4. Frais de retour", paragraphs: ["Les frais de retour sont à la charge du client, sauf si l’article est défectueux, non conforme à la commande ou si une erreur a été commise lors de sa préparation. Dans ces cas, Aighis Byrca prend les frais en charge."] },
        { title: "5. Remboursement", paragraphs: ["Le remboursement est effectué dans les 14 jours suivant la réception et la vérification de l’article retourné, via le même moyen de paiement que celui utilisé lors de la commande. Les frais de livraison initiaux ne sont pas remboursés, sauf en cas d’erreur de notre part."] },
        { title: "6. Échanges", paragraphs: ["Pour échanger un article contre une autre taille ou couleur, suivez la procédure de retour puis passez une nouvelle commande. Cela permet de traiter votre demande plus rapidement."] },
        { title: "7. Contact", paragraphs: ["Pour toute question concernant les retours, contactez-nous à aighisbyrca@gmail.com."], link: { before: "Consultez également nos ", label: "Conditions générales de vente", after: ".", href: "/terms" } },
      ],
    },
    terms: {
      title: "Conditions générales de vente", updated: "Dernière mise à jour : juillet 2026",
      sections: [
        { title: "1. Champ d’application", paragraphs: ["Les présentes Conditions générales de vente régissent les transactions réalisées sur aighisbyrca.com entre Aighis Byrca et les clients consommateurs. Toute commande implique leur acceptation sans réserve."] },
        { title: "2. Produits", paragraphs: ["Les produits sont décrits avec précision. Les photographies sont fournies à titre indicatif et ne sont pas contractuelles. Aighis Byrca s’engage à livrer des produits conformes à la description publiée au moment de la commande."] },
        { title: "3. Prix", paragraphs: ["Les prix sont indiqués en dinars tunisiens (TND) et incluent la TVA au taux en vigueur en Tunisie. Les frais de livraison sont précisés avant la validation de la commande et peuvent varier selon la destination et le mode de livraison choisi."] },
        { title: "4. Commande", paragraphs: ["La commande est confirmée après validation du paiement. Un e-mail de confirmation est envoyé à l’adresse renseignée par le client. Aighis Byrca se réserve le droit d’annuler une commande en cas de litige antérieur, d’indisponibilité du produit ou d’erreur manifeste sur le prix."] },
        { title: "5. Paiement", paragraphs: ["Les moyens de paiement acceptés sont le paiement à la livraison, le virement bancaire et D17. Le paiement est encaissé lors de la confirmation de la commande. Les transactions sont sécurisées conformément à la législation tunisienne."] },
        { title: "6. Livraison", paragraphs: ["La livraison est effectuée à l’adresse indiquée par le client, généralement sous 3 à 7 jours ouvrés en Tunisie. Aighis Byrca ne peut être tenue responsable des retards indépendants de sa volonté. Tout article manquant ou endommagé doit être signalé dans les 48 heures suivant la réception."] },
        { title: "7. Droit de rétractation", paragraphs: ["Conformément à la Loi tunisienne n° 2018-20 du 17 avril 2018 relative aux transactions électroniques, le client dispose de 14 jours à compter de la réception pour se rétracter sans motif ni pénalité.", "Les articles retournés doivent être non portés, non lavés, dans leur état d’origine et munis de toutes leurs étiquettes. Les frais de retour sont à la charge du client, sauf si le produit est défectueux ou si une erreur a été commise."], link: { before: "Consultez notre ", label: "Politique de retour", after: " pour en savoir plus.", href: "/returns" } },
        { title: "8. Garantie", paragraphs: ["Nos produits bénéficient de la garantie légale de conformité prévue par le Code tunisien de la consommation (Loi n° 92-117 du 7 décembre 1992). En cas de défaut de conformité, le client peut demander le remplacement ou le remboursement du produit."] },
        { title: "9. Litiges", paragraphs: ["Les présentes conditions sont soumises au droit tunisien. En cas de litige, contactez le service client à aighisbyrca@gmail.com. À défaut de résolution amiable, les tribunaux de Tunis sont seuls compétents."] },
      ],
    },
  },
};

export default function LegalDocument({ document }: { document: DocumentKey }) {
  const { locale } = useLocale();
  const copy = documents[locale][document];

  return (
    <div className={styles.page}>
      <Navbar compact />
      <section className={styles.header}><h1>{copy.title}</h1></section>
      <section className={styles.content}>
        <p className={styles.lastUpdated}>{copy.updated}</p>
        {copy.sections.map((section) => (
          <div key={section.title} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            {section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
            {section.link && <p>{section.link.before}<Link href={section.link.href} className={styles.link}>{section.link.label}</Link>{section.link.after}</p>}
          </div>
        ))}
      </section>
      <Footer />
    </div>
  );
}
