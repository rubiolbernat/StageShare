export interface AppTab {
  id: string;              // Identificador únic
  route: string;           // Ruta associada
  title: string;           // Títol de la pestanya
  icon?: string;           // Icona opcional
  component: string;       // Nom del component a renderitzar
  componentData?: any;     // Estat intern
  canSave?: boolean;       // Si es pot guardar
  saved?: boolean;         // Si està guardat
  allowMultiple?: boolean; // Si pot tenir múltiples instàncies
  info?: string;         // Informació addicional
}
