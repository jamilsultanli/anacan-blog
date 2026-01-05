import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../appwrite';

export interface MenuItem {
  id: string;
  label: string;
  label_az?: string;
  label_ru?: string;
  url: string;
  target?: '_blank' | '_self';
  children?: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  location: 'header' | 'footer';
  items: MenuItem[];
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

class MenusService {
  async getMenus(location?: 'header' | 'footer'): Promise<{ data: Menu[]; error: Error | null }> {
    try {
      const queries = location ? [Query.equal('location', location)] : [];
      // Order by creation date (menus collection may not have 'order' attribute in schema)
      queries.push(Query.orderAsc('$createdAt'));

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MENUS,
        queries
      );

      const menus: Menu[] = response.documents.map(doc => {
        const parsedItems = doc.items ? JSON.parse(doc.items) : [];
        // Ensure menu items have label_az and label_ru if they don't
        const itemsWithLabels = parsedItems.map((item: any) => ({
          ...item,
          label_az: item.label_az || item.label || '',
          label_ru: item.label_ru || item.label || '',
        }));
        
        return {
          id: doc.$id,
          name: doc.name,
          location: doc.location,
          items: itemsWithLabels,
          order: doc.order,
          createdAt: doc.$createdAt,
          updatedAt: doc.$updatedAt,
        };
      });

      return { data: menus, error: null };
    } catch (error: any) {
      console.error('Error getting menus:', error);
      return { data: [], error: new Error(error.message || 'Failed to get menus') };
    }
  }

  async getMenuById(id: string): Promise<{ data: Menu | null; error: Error | null }> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.MENUS, id);
      const menu: Menu = {
        id: doc.$id,
        name: doc.name,
        location: doc.location,
        items: doc.items ? JSON.parse(doc.items) : [],
        order: doc.order,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      };
      return { data: menu, error: null };
    } catch (error: any) {
      console.error('Error getting menu:', error);
      return { data: null, error: new Error(error.message || 'Failed to get menu') };
    }
  }

  async createMenu(menu: Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Menu | null; error: Error | null }> {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MENUS,
        ID.unique(),
        {
          name: menu.name,
          location: menu.location,
          items: JSON.stringify(menu.items || []),
          order: menu.order || 0,
        }
      );

      const createdMenu: Menu = {
        id: doc.$id,
        name: doc.name,
        location: doc.location,
        items: doc.items ? JSON.parse(doc.items) : [],
        order: doc.order,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      };

      return { data: createdMenu, error: null };
    } catch (error: any) {
      console.error('Error creating menu:', error);
      return { data: null, error: new Error(error.message || 'Failed to create menu') };
    }
  }

  async updateMenu(id: string, menu: Partial<Menu>): Promise<{ data: Menu | null; error: Error | null }> {
    try {
      const updateData: any = {};
      if (menu.name !== undefined) updateData.name = menu.name;
      if (menu.location !== undefined) updateData.location = menu.location;
      if (menu.items !== undefined) updateData.items = JSON.stringify(menu.items);
      if (menu.order !== undefined) updateData.order = menu.order;

      const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.MENUS, id, updateData);

      const updatedMenu: Menu = {
        id: doc.$id,
        name: doc.name,
        location: doc.location,
        items: doc.items ? JSON.parse(doc.items) : [],
        order: doc.order,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      };

      return { data: updatedMenu, error: null };
    } catch (error: any) {
      console.error('Error updating menu:', error);
      return { data: null, error: new Error(error.message || 'Failed to update menu') };
    }
  }

  async deleteMenu(id: string): Promise<{ error: Error | null }> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.MENUS, id);
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting menu:', error);
      return { error: new Error(error.message || 'Failed to delete menu') };
    }
  }
}

export const menusService = new MenusService();

