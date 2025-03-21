import { signalStore, withState } from '@ngrx/signals';
import { ItemDto } from '../../dtos';

type ItemsState = {
    items: ItemDto[] | null,
    isLoading: boolean,
    filter: { query: string } | null
}

const initialState: ItemsState = {
    items: null,
    isLoading: false,
    filter: null
}

export const itemsStore = signalStore(
    {providedIn: 'root'},
    withState(initialState)
)