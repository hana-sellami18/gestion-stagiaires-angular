export interface Candidature {
  id: number;
  candidat: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    universite: string;
    niveau: string;
    specialite: string;
  };
  offre: {
    id: number;
    titre: string;
    domaine: string;
    type: string;
  };
  cvUrl: string;
  dateDepot: Date;
  statut: 'en_attente' | 'acceptee' | 'refusee';
  lettreMotivation?: string;
}
