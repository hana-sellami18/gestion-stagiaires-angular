export interface OffreStage {
  id?: number;
titre: string;
description: string;
filiereId?: number | null;
cycleId?: number | null;
filiereCible?: { id: number; nom: string } | string;
cycleCible?: { id: number; nom: string } | string;
estDisponible: boolean;
competences: string[];
statut?: 'Ouvert' | 'Fermé' | 'En attente';
datePublication?: Date | string;
idRh?: number;
}
