import { ComponentProps, DragEvent, LiHTMLAttributes, createElement, useEffect, useState } from 'react';
import {
    ComposedModal,
    ContainedList,
    ContainedListItem,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from '@carbon/react';
import { Account } from '@balance/dto/accounts';
import { useTranslation } from 'react-i18next';
import { resolveIcon } from '../../../../../shared/ui/icon';
import styles from './account-reorder-modal.module.scss';

type AccountReorderModalProps = {
    readonly open: boolean;
    readonly accounts: readonly Account[];
    readonly onClose: () => void;
    readonly onSave: (orderedIds: readonly Account['id'][]) => Promise<void>;
};

type ContainedListItemProps = ComponentProps<typeof ContainedListItem>;

type DraggableContainedListItemProps = ContainedListItemProps &
    Pick<
        LiHTMLAttributes<HTMLLIElement>,
        'draggable' | 'onDragStart' | 'onDragOver' | 'onDrop' | 'onDragEnd'
    >;

/**
 * ContainedListItem forwards unknown props onto `<li>` at runtime, but Carbon’s
 * published props omit HTML attributes. This adapter exposes drag-and-drop props.
 */
function DraggableContainedListItem(props: DraggableContainedListItemProps) {
    return createElement(ContainedListItem, props as ContainedListItemProps);
}

/**
 * Modal to reorder dashboard account tiles via drag-and-drop on a ContainedList.
 */
export function AccountReorderModal({ open, accounts, onClose, onSave }: AccountReorderModalProps) {
    const { t } = useTranslation();
    const [order, setOrder] = useState<readonly Account[]>(accounts);
    const [draggingId, setDraggingId] = useState<Account['id'] | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setOrder(accounts);
            setDraggingId(null);
            setIsSaving(false);
        }
    }, [open, accounts]);

    const move = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= order.length || fromIndex === toIndex) {
            return;
        }

        const next = [...order];
        const [item] = next.splice(fromIndex, 1);

        if (!item) {
            return;
        }

        next.splice(toIndex, 0, item);
        setOrder(next);
    };

    const onDropOn = (targetId: Account['id']) => {
        if (!draggingId || draggingId === targetId) {
            setDraggingId(null);
            return;
        }

        const fromIndex = order.findIndex((account) => account.id === draggingId);
        const toIndex = order.findIndex((account) => account.id === targetId);

        if (fromIndex === -1 || toIndex === -1) {
            setDraggingId(null);
            return;
        }

        move(fromIndex, toIndex);
        setDraggingId(null);
    };

    const onSubmit = async () => {
        setIsSaving(true);

        try {
            await onSave(order.map((account) => account.id));
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ComposedModal open={open} size="sm" onClose={() => !isSaving && onClose()} preventCloseOnClickOutside={isSaving}>
            <ModalHeader title={t('accounts.reorderTitle')} label={t('accounts.title')} />
            <ModalBody>
                <ContainedList label={t('accounts.title')} kind="on-page" size="md">
                    {order.map((account) => (
                        <DraggableContainedListItem
                            key={account.id}
                            className={`${styles.item} ${draggingId === account.id ? styles.dragging : ''}`.trim()}
                            renderIcon={resolveIcon(account.icon)}
                            draggable={!isSaving}
                            onDragStart={(event: DragEvent<HTMLLIElement>) => {
                                setDraggingId(account.id);
                                event.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(event: DragEvent<HTMLLIElement>) => {
                                event.preventDefault();
                            }}
                            onDrop={(event: DragEvent<HTMLLIElement>) => {
                                event.preventDefault();
                                onDropOn(account.id);
                            }}
                            onDragEnd={() => setDraggingId(null)}
                        >
                            {account.name}
                        </DraggableContainedListItem>
                    ))}
                </ContainedList>
            </ModalBody>
            <ModalFooter
                primaryButtonText={t('accounts.actions.saveOrder')}
                secondaryButtonText={t('accounts.actions.cancel')}
                primaryButtonDisabled={isSaving}
                loadingStatus={isSaving ? 'active' : 'inactive'}
                loadingDescription={t('common.loading')}
                onRequestSubmit={() => {
                    void onSubmit();
                }}
                onRequestClose={onClose}
            >
                {null}
            </ModalFooter>
        </ComposedModal>
    );
}
