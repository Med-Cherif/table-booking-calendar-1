import { create } from 'zustand';

interface EventsState {
  focusedTimestamp: number;
  FocusedCapacity: number;
  isResizing: boolean;
  isDraging: boolean;
  setFocusedTimestamp: (timestamp: number) => void;
  setFocusedCapacity: (capacity: number) => void;
  setIsResizing: (isResizing: boolean) => void;
  setIsDraging: (isDraging: boolean) => void;
}

export const useEventsStore = create<EventsState>()((set) => ({
  focusedTimestamp: -1,
  FocusedCapacity: -1,
  isResizing: false,
  isDraging: false,
  setIsResizing: (isResizing: boolean) => set({ isResizing }),
  setIsDraging: (isDraging: boolean) => set({ isDraging }),
  setFocusedTimestamp: (timestamp: number) =>
    set({ focusedTimestamp: timestamp }),
  setFocusedCapacity: (capacity: number) => set({ FocusedCapacity: capacity }),
}));
export const useFocusedTimestamp = () =>
  useEventsStore((state) => state.focusedTimestamp);
export const useFocusedCapacity = () =>
  useEventsStore((state) => state.FocusedCapacity);
