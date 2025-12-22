import { useState, useEffect, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';

// Interface defining the minimum requirement for items managed by this hook
interface Identifiable {
    id: string; // Items must have a unique 'id' property for tracking order
}

/**
 * Custom hook to manage a list of items with drag-and-drop persistence.
 * 
 * @param key - The localStorage key used to save the item order.
 * @param initialItems - The initial list of items to display if no valid order is saved.
 * @returns An object containing the current items, a setter for items, and the drag end handler.
 */
export function usePersistentNav<T extends Identifiable>(
    key: string,
    initialItems: T[]
) {
    // State to hold the current list of items in their specific order
    const [items, setItems] = useState<T[]>(initialItems);

    // Effect to load saved order from localStorage on component mount
    useEffect(() => {
        const savedOrder = localStorage.getItem(key);
        if (savedOrder) {
            try {
                const parsedOrder = JSON.parse(savedOrder);

                // Validation: Ensure the parsed data is an array
                if (Array.isArray(parsedOrder)) {
                    // Reconstruct the item list based on the saved ID order
                    const orderedItems = parsedOrder
                        .map((id: string) => initialItems.find(item => item.id === id))
                        .filter((item): item is T => !!item); // Type predicate to remove undefined results

                    // Identify any new items in initialItems that were not present in the saved order
                    const newItems = initialItems.filter(
                        item => !parsedOrder.includes(item.id)
                    );

                    // Update state with the saved order + any new items appended at the end
                    setItems([...orderedItems, ...newItems]);
                }
            } catch (e) {
                // Graceful failure: Log error and fall back to initialItems (already set in state)
                console.error(`Failed to parse saved navigation order for key: ${key}`, e);
            }
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    /**
     * Handler for the drag-and-drop 'end' event.
     * Reorders the items array and persists the new order to localStorage.
     */
    const onDragEnd = useCallback((result: DropResult) => {
        // If dropped outside a droppable area, do nothing
        if (!result.destination) return;

        setItems(prevItems => {
            // Create a shallow copy of the items array to avoid mutating state directly
            const newItems = [...prevItems];

            // Remove the item from its original position
            const [reorderedItem] = newItems.splice(result.source.index, 1);

            // Insert the item at its new position
            newItems.splice(result.destination.index, 0, reorderedItem);

            // Save the new array of IDs to localStorage for persistence
            const order = newItems.map(item => item.id);
            localStorage.setItem(key, JSON.stringify(order));

            return newItems;
        });
    }, [key]); // Re-create this function only if the storage key changes

    return { items, setItems, onDragEnd };
}
