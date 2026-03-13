import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CampParticipation } from '../../api/participations.api';
import type { Player } from '../../api/players.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import { ApiClientError } from '../../lib/errors';
import { duelFormSchema, type DuelFormValues } from './duel-form.schema';
import { useDuelMutations } from './use-duel-mutations';
import { useDuelsByBattleQuery } from './use-duels-query';

function getPlayerDisplayName(player: Player | undefined): string {
  if (!player) {
    return 'Unknown player';
  }

  const fullName = `${player.firstName} ${player.lastName ?? ''}`.trim();
  return fullName || player.nickname?.trim() || player.id;
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

export function DuelSessionEditor({
  battleId,
  participations,
  players,
}: {
  battleId: string;
  participations: CampParticipation[];
  players: Player[];
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const duelsQuery = useDuelsByBattleQuery(battleId);
  const { createMutation, updateMutation, deleteMutation } = useDuelMutations(battleId);

  const playersById = useMemo(() => {
    const map = new Map<string, Player>();

    for (const player of players) {
      map.set(player.id, player);
    }

    return map;
  }, [players]);

  const participationLabelOptions = useMemo(() => {
    return participations.map((participation) => ({
      id: participation.id,
      label: getPlayerDisplayName(playersById.get(participation.playerId)),
    }));
  }, [participations, playersById]);

  const form = useForm<DuelFormValues>({
    resolver: zodResolver(duelFormSchema),
    defaultValues: {
      playerAParticipationId: '',
      playerBParticipationId: '',
      winnerParticipationId: '',
    },
  });

  async function handleCreate(values: DuelFormValues): Promise<void> {
    if (values.playerAParticipationId === values.playerBParticipationId) {
      setFeedback({ kind: 'error', message: 'Player A and Player B must be different.' });
      return;
    }

    try {
      await createMutation.mutateAsync({
        battleId,
        playerAParticipationId: values.playerAParticipationId,
        playerBParticipationId: values.playerBParticipationId,
        winnerParticipationId: values.winnerParticipationId?.trim() || undefined,
      });

      setFeedback({ kind: 'success', message: 'Duel created successfully.' });
      setIsAddOpen(false);
      form.reset({
        playerAParticipationId: '',
        playerBParticipationId: '',
        winnerParticipationId: '',
      });
    } catch (error) {
      setFeedback({ kind: 'error', message: getMutationErrorMessage(error, 'Unable to create duel.') });
    }
  }

  async function handleUpdateWinner(
    duelId: string,
    winnerParticipationId: string,
    playerAParticipationId: string,
    playerBParticipationId: string,
  ): Promise<void> {
    if (winnerParticipationId !== playerAParticipationId && winnerParticipationId !== playerBParticipationId) {
      setFeedback({ kind: 'error', message: 'Winner must be either Player A or Player B.' });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: duelId,
        payload: { winnerParticipationId },
      });
      setFeedback({ kind: 'success', message: 'Duel winner updated successfully.' });
    } catch (error) {
      setFeedback({ kind: 'error', message: getMutationErrorMessage(error, 'Unable to update duel winner.') });
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const shouldDelete = window.confirm('Delete this duel? This action cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      setFeedback({ kind: 'success', message: 'Duel removed successfully.' });
    } catch (error) {
      setFeedback({ kind: 'error', message: getMutationErrorMessage(error, 'Unable to remove duel.') });
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Duels</h3>
            <p className="text-sm text-slate-600">Create duels and manage winners for this duel session.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setIsAddOpen(true);
            }}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add Duel
          </button>
        </div>
      </SectionCard>

      {feedback ? (
        <div
          className={
            feedback.kind === 'success'
              ? 'rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'
              : 'rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
          }
        >
          {feedback.message}
        </div>
      ) : null}

      <ModalDrawer
        open={isAddOpen}
        title="Create Duel"
        onClose={() => {
          setIsAddOpen(false);
        }}
      >
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await handleCreate(values);
          })}
          noValidate
        >
          <div>
            <label htmlFor="playerA" className="mb-1 block text-sm font-medium text-slate-700">
              Player A
            </label>
            <select
              id="playerA"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('playerAParticipationId')}
            >
              <option value="">Select participation</option>
              {participationLabelOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {form.formState.errors.playerAParticipationId ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.playerAParticipationId.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="playerB" className="mb-1 block text-sm font-medium text-slate-700">
              Player B
            </label>
            <select
              id="playerB"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('playerBParticipationId')}
            >
              <option value="">Select participation</option>
              {participationLabelOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {form.formState.errors.playerBParticipationId ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.playerBParticipationId.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="winner" className="mb-1 block text-sm font-medium text-slate-700">
              Winner (optional)
            </label>
            <select
              id="winner"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('winnerParticipationId')}
            >
              <option value="">No winner yet</option>
              {participationLabelOptions
                .filter((option) => {
                  const playerA = form.watch('playerAParticipationId');
                  const playerB = form.watch('playerBParticipationId');
                  return option.id === playerA || option.id === playerB;
                })
                .map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
            </select>
            {form.formState.errors.winnerParticipationId ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.winnerParticipationId.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending ? 'Запазване...' : 'Създай двубой'}
            </button>
          </div>
        </form>
      </ModalDrawer>

      {duelsQuery.isLoading ? <LoadingState label="Loading duels..." /> : null}

      {duelsQuery.isError ? (
        <ErrorState
          message="Unable to load duels right now."
          onRetry={() => {
            void duelsQuery.refetch();
          }}
        />
      ) : null}

      {duelsQuery.isSuccess && duelsQuery.data.length === 0 ? (
        <EmptyState title="No duels yet" description="Create the first duel for this session." />
      ) : null}

      {duelsQuery.isSuccess && duelsQuery.data.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {duelsQuery.data.map((duel) => {
            const playerA = participationLabelOptions.find((item) => item.id === duel.playerAParticipationId);
            const playerB = participationLabelOptions.find((item) => item.id === duel.playerBParticipationId);
            const winner = participationLabelOptions.find((item) => item.id === duel.winnerParticipationId);

            return (
              <SectionCard key={duel.id}>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Duel ID: {duel.id}</p>
                  </div>

                  <div className="space-y-1 text-sm text-slate-700">
                    <p>
                      <span className="font-medium text-slate-800">Player A:</span> {playerA?.label || duel.playerAParticipationId}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">Player B:</span> {playerB?.label || duel.playerBParticipationId}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">Winner:</span> {winner?.label || 'Not set'}
                    </p>
                  </div>

                  <div>
                    <label htmlFor={`winner-${duel.id}`} className="mb-1 block text-sm font-medium text-slate-700">
                      Set winner
                    </label>
                    <select
                      id={`winner-${duel.id}`}
                      defaultValue={duel.winnerParticipationId ?? ''}
                      onChange={(event) => {
                        const value = event.target.value;

                        if (!value) {
                          return;
                        }

                        void handleUpdateWinner(
                          duel.id,
                          value,
                          duel.playerAParticipationId,
                          duel.playerBParticipationId,
                        );
                      }}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
                    >
                      <option value="">Keep current</option>
                      <option value={duel.playerAParticipationId}>{playerA?.label || 'Player A'}</option>
                      <option value={duel.playerBParticipationId}>{playerB?.label || 'Player B'}</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        void handleDelete(duel.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Remove Duel
                    </button>
                  </div>
                </div>
              </SectionCard>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}
