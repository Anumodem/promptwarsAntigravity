import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KanbanBoard from '../components/KanbanBoard';

// Mock dnd to avoid complexity in unit tests
vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: any) => <div>{children}</div>,
  Droppable: ({ children }: any) => (
    <div>
      {children(
        { 
          innerRef: vi.fn(), 
          droppableProps: {} 
        }, 
        { isDraggingOver: false }
      )}
    </div>
  ),
  Draggable: ({ children }: any) => (
    <div>
      {children(
        { 
          innerRef: vi.fn(), 
          draggableProps: { style: {} }, 
          dragHandleProps: {} 
        }, 
        { isDragging: false }
      )}
    </div>
  ),
}));

describe('KanbanBoard', () => {
  it('renders all columns', () => {
    render(<KanbanBoard searchQuery="" />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('filters tasks based on search query', () => {
    render(<KanbanBoard searchQuery="Design" />);
    // "Design System Implementation" should be visible
    expect(screen.getByText('Design System Implementation')).toBeInTheDocument();
    // "API Rate Limiting" should NOT be visible
    expect(screen.queryByText('API Rate Limiting')).not.toBeInTheDocument();
  });

  it('opens the create task modal', () => {
    render(<KanbanBoard searchQuery="" />);
    const createBtn = screen.getByLabelText(/Add New Task/i);
    fireEvent.click(createBtn);
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
  });
});
