// Types para o Kanban
export interface Stage {
  id: string;
  title: string;
  order_index: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ContactStage {
  id: string;
  contact_id: string;
  stage_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatwootContact {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  thumbnail?: string;
  additional_attributes?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatwootContactsResponse {
  data: {
    payload: ChatwootContact[];
    meta: {
      count: number;
      current_page: number;
      total_pages: number;
    };
  };
}

// Types para react-trello
export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  label?: string;
  draggable?: boolean;
  metadata?: {
    contactId: number;
    phone?: string;
    email?: string;
    thumbnail?: string;
  };
}

export interface KanbanLane {
  id: string;
  title: string;
  label?: string;
  cards: KanbanCard[];
  style?: {
    backgroundColor?: string;
    color?: string;
  };
}

export interface KanbanBoard {
  lanes: KanbanLane[];
}

export interface CreateStageData {
  title: string;
  color?: string;
  order_index?: number;
}
