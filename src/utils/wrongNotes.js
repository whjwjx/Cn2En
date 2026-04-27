import { wrongNotesAPI } from '../services/api';

export async function getWrongNotes() {
  try {
    const notes = await wrongNotesAPI.getAll();
    return {
      wrong_ids: notes.map(note => note.item_id),
      added_at: notes.reduce((acc, note) => {
        acc[note.item_id] = note.added_at;
        return acc;
      }, {}),
    };
  } catch (error) {
    console.error('Failed to get wrong notes:', error);
    return { wrong_ids: [], added_at: {} };
  }
}

export async function addToWrongNotes(itemId) {
  try {
    const note = await wrongNotesAPI.add(itemId);
    return {
      wrong_ids: [note.item_id],
      added_at: { [note.item_id]: note.added_at },
    };
  } catch (error) {
    console.error('Failed to add to wrong notes:', error);
    return { wrong_ids: [], added_at: {} };
  }
}

export async function removeFromWrongNotes(itemId) {
  try {
    await wrongNotesAPI.remove(itemId);
    const notes = await getWrongNotes();
    return notes;
  } catch (error) {
    console.error('Failed to remove from wrong notes:', error);
    return { wrong_ids: [], added_at: {} };
  }
}

export async function isInWrongNotes(itemId) {
  try {
    const result = await wrongNotesAPI.check(itemId);
    return result.is_wrong;
  } catch (error) {
    console.error('Failed to check wrong notes:', error);
    return false;
  }
}

export async function clearWrongNotes() {
  try {
    await wrongNotesAPI.clear();
  } catch (error) {
    console.error('Failed to clear wrong notes:', error);
  }
}
