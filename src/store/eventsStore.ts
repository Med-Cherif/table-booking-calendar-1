import { create } from 'zustand';

interface EventsState {
  focusedTimestamp: number;
  FocusedCapacity: number;
  isResizing: boolean;
  setFocusedTimestamp: (timestamp: number) => void;
  setFocusedCapacity: (capacity: number) => void;
  setIsResizing: (isResizing: boolean) => void;
}

export const useEventsStore = create<EventsState>()((set) => ({
  focusedTimestamp: -1,
  FocusedCapacity: -1,
  isResizing: false,
  setIsResizing: (isResizing: boolean) => set({ isResizing }),
  setFocusedTimestamp: (timestamp: number) =>
    set({ focusedTimestamp: timestamp }),
  setFocusedCapacity: (capacity: number) => set({ FocusedCapacity: capacity }),
}));
export const useFocusedTimestamp = () =>
  useEventsStore((state) => state.focusedTimestamp);
export const useFocusedCapacity = () =>
  useEventsStore((state) => state.FocusedCapacity);
