import { useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { Player } from '../../api/players.api';
import { getCurrentTeamAssignmentByParticipation } from '../../api/team-assignments.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import { Badge } from '../../components/ui/Badge';
import { AssetPicker } from '../../components/ui/AssetPicker';
import { useCampTeamsByCampQuery } from '../camp-teams/use-camp-teams-query';
import { usePlayerMutations } from '../players/use-player-mutations';
import { usePlayersQuery } from '../players/use-players-query';
import { useParticipationMutations } from './use-participation-mutations';
import { useParticipationsByCampQuery } from './use-participations-query';
import { ApiClientError } from '../../lib/errors';
import { useTeamAssignmentMutations } from '../team-assignments/use-team-assignment-mutations';

type AddParticipantMode = 'existing' | 'new';

function getPlayerDisplayName(player: Player | undefined): string {
  if (!player) {
    return 'Неизвестен играч';
  }

  const fullName = `${player.firstName} ${player.lastName ?? ''}`.trim();
  if (fullName) {
    return fullName;
  }

  return player.nickname?.trim() || player.id;
}

function PlayerAvatar({ src, fullName }: { src: string | null; fullName: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={`${fullName} avatar`}
        className="h-12 w-12 rounded-full border border-slate-200 object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-500">
      {fullName.charAt(0).toUpperCase()}
    </div>
  );
}

export function CampParticipationsTab({ campId }: { campId: string }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<AddParticipantMode>('existing');
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [newPlayerFirstName, setNewPlayerFirstName] = useState('');
  const [newPlayerLastName, setNewPlayerLastName] = useState('');
  const [newPlayerNickname, setNewPlayerNickname] = useState('');
  const [newPlayerAvatarUrl, setNewPlayerAvatarUrl] = useState('');
  const [newPlayerIsActive, setNewPlayerIsActive] = useState(true);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const participationsQuery = useParticipationsByCampQuery(campId);
  const campTeamsQuery = useCampTeamsByCampQuery(campId);
  const allPlayersQuery = usePlayersQuery();
  const searchablePlayersQuery = usePlayersQuery(playerSearch);
  const { createMutation } = useParticipationMutations(campId);
  const { createMutation: createPlayerMutation } = usePlayerMutations();
  const { createMutation: createTeamAssignmentMutation } = useTeamAssignmentMutations();

  const playersById = useMemo(() => {
    const map = new Map<string, Player>();

    for (const player of allPlayersQuery.data ?? []) {
      map.set(player.id, player);
    }

    return map;
  }, [allPlayersQuery.data]);

  const teamNameById = useMemo(() => {
    const map = new Map<string, string>();

    for (const team of campTeamsQuery.data ?? []) {
      map.set(team.id, team.name);
    }

    return map;
  }, [campTeamsQuery.data]);

  const participatingPlayerIds = useMemo(() => {
    const ids = new Set<string>();

    for (const participation of participationsQuery.data ?? []) {
      ids.add(participation.playerId);
    }

    return ids;
  }, [participationsQuery.data]);

  const currentTeamQueries = useQueries({
    queries: (participationsQuery.data ?? []).map((participation) => ({
      queryKey: ['team-assignments', 'current', participation.id],
      queryFn: () => getCurrentTeamAssignmentByParticipation(participation.id),
      enabled: participationsQuery.isSuccess,
    })),
  });

  const currentAssignmentByParticipationId = useMemo(() => {
    const map = new Map<string, { teamId: string | null; state: 'ready' | 'loading' | 'error' }>();
    const participations = participationsQuery.data ?? [];

    participations.forEach((participation, index) => {
      const assignmentQuery = currentTeamQueries[index];

      if (!assignmentQuery || assignmentQuery.isLoading) {
        map.set(participation.id, { teamId: null, state: 'loading' });
        return;
      }

      if (assignmentQuery.isError) {
        map.set(participation.id, { teamId: null, state: 'error' });
        return;
      }

      map.set(participation.id, {
        teamId: assignmentQuery.data?.teamId ?? null,
        state: 'ready',
      });
    });

    return map;
  }, [participationsQuery.data, currentTeamQueries]);

  function resetAddFlowState() {
    setAddMode('existing');
    setPlayerSearch('');
    setSelectedPlayerId('');
    setSelectedTeamId('');
    setNewPlayerFirstName('');
    setNewPlayerLastName('');
    setNewPlayerNickname('');
    setNewPlayerAvatarUrl('');
    setNewPlayerIsActive(true);
    setAvatarPickerOpen(false);
  }

  async function handleCreateParticipationWithTeam(playerId: string, teamId: string) {
    const participation = await createMutation.mutateAsync({ campId, playerId });

    await createTeamAssignmentMutation.mutateAsync({
      participationId: participation.id,
      teamId,
    });
  }

  async function handleSubmitAddParticipant() {
    if (!selectedTeamId) {
      setFeedback({ kind: 'error', message: 'Избери начален отбор.' });
      return;
    }

    if (addMode === 'existing') {
      if (!selectedPlayerId) {
        setFeedback({ kind: 'error', message: 'Първо избери играч.' });
        return;
      }

      if (participatingPlayerIds.has(selectedPlayerId)) {
        setFeedback({
          kind: 'error',
          message: 'Този играч вече участва в избрания лагер.',
        });
        return;
      }

      try {
        await handleCreateParticipationWithTeam(selectedPlayerId, selectedTeamId);
        setFeedback({ kind: 'success', message: 'Участникът е добавен и началният отбор е зададен.' });
        resetAddFlowState();
        setIsAddModalOpen(false);
      } catch (error) {
        if (error instanceof ApiClientError) {
          setFeedback({ kind: 'error', message: error.message });
          return;
        }

        setFeedback({ kind: 'error', message: 'Неуспешно добавяне на участник в момента.' });
      }

      return;
    }

    const firstName = newPlayerFirstName.trim();
    const lastName = newPlayerLastName.trim();
    const nickname = newPlayerNickname.trim();
    const avatarUrl = newPlayerAvatarUrl.trim();

    if (!firstName) {
      setFeedback({ kind: 'error', message: 'Името е задължително.' });
      return;
    }

    try {
      const createdPlayer = await createPlayerMutation.mutateAsync({
        firstName,
        lastName: lastName || undefined,
        nickname: nickname || undefined,
        avatarUrl: avatarUrl || undefined,
        isActive: newPlayerIsActive,
      });

      await handleCreateParticipationWithTeam(createdPlayer.id, selectedTeamId);

      setFeedback({ kind: 'success', message: 'Играчът е създаден, добавен в лагера и разпределен в отбор.' });
      resetAddFlowState();
      setIsAddModalOpen(false);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFeedback({ kind: 'error', message: error.message });
        return;
      }

      setFeedback({ kind: 'error', message: 'Неуспешно създаване на участник в момента.' });
    }
  }

  const selectablePlayers = (searchablePlayersQuery.data ?? []).filter(
    (player) => !participatingPlayerIds.has(player.id),
  );

  const isSubmittingAddFlow =
    createMutation.isPending || createPlayerMutation.isPending || createTeamAssignmentMutation.isPending;

  const normalizedParticipantSearch = participantSearch.trim().toLocaleLowerCase();

  const filteredParticipations = useMemo(() => {
    const participations = participationsQuery.data ?? [];
    if (!normalizedParticipantSearch) {
      return participations;
    }

    return participations.filter((participation) => {
      const player = playersById.get(participation.playerId);
      const firstName = player?.firstName?.toLocaleLowerCase() ?? '';
      const lastName = player?.lastName?.toLocaleLowerCase() ?? '';
      const nickname = player?.nickname?.toLocaleLowerCase() ?? '';

      return (
        firstName.includes(normalizedParticipantSearch)
        || lastName.includes(normalizedParticipantSearch)
        || nickname.includes(normalizedParticipantSearch)
      );
    });
  }, [participationsQuery.data, playersById, normalizedParticipantSearch]);

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Участници в лагера</h3>
            <p className="text-sm text-slate-600">Прегледай участниците и добавяй играчи с начален отбор.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setIsAddModalOpen(true);
            }}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Добави участник
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
        open={isAddModalOpen}
        title="Добави участник"
        onClose={() => {
          setIsAddModalOpen(false);
          resetAddFlowState();
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setAddMode('existing');
              }}
              className={
                addMode === 'existing'
                  ? 'rounded-md border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-medium text-white'
                  : 'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
              }
            >
              Добави съществуващ играч
            </button>
            <button
              type="button"
              onClick={() => {
                setAddMode('new');
              }}
              className={
                addMode === 'new'
                  ? 'rounded-md border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-medium text-white'
                  : 'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
              }
            >
              Създай нов играч
            </button>
          </div>

          {addMode === 'existing' ? (
            <>
              <div>
                <label htmlFor="playerSearch" className="mb-1 block text-sm font-medium text-slate-700">
                  Търси играч
                </label>
                <input
                  id="playerSearch"
                  value={playerSearch}
                  onChange={(event) => {
                    setPlayerSearch(event.target.value);
                  }}
                  placeholder="Въведи име или прякор"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
                />
              </div>

              {searchablePlayersQuery.isLoading ? <LoadingState label="Търсене на играчи..." /> : null}

              {searchablePlayersQuery.isError ? (
                <ErrorState
                  message="Неуспешно търсене на играчи в момента."
                  onRetry={() => {
                    void searchablePlayersQuery.refetch();
                  }}
                />
              ) : null}

              {searchablePlayersQuery.isSuccess ? (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {selectablePlayers.length === 0 ? (
                    <EmptyState
                      title="Няма налични играчи"
                      description="Всички намерени играчи вече участват в този лагер."
                    />
                  ) : (
                    selectablePlayers.map((player) => {
                      const isSelected = selectedPlayerId === player.id;

                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => {
                            setSelectedPlayerId(player.id);
                          }}
                          className={
                            isSelected
                              ? 'w-full rounded-md border-2 border-sky-500 bg-sky-50 px-3 py-2 text-left'
                              : 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-left hover:bg-slate-50'
                          }
                        >
                          <p className="text-sm font-medium text-slate-900">{getPlayerDisplayName(player)}</p>
                          <p className="text-xs text-slate-600">{player.nickname ? `@${player.nickname}` : player.id}</p>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : null}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="newPlayerFirstName" className="mb-1 block text-sm font-medium text-slate-700">
                  Име
                </label>
                <input
                  id="newPlayerFirstName"
                  value={newPlayerFirstName}
                  onChange={(event) => {
                    setNewPlayerFirstName(event.target.value);
                  }}
                  placeholder="Въведи име"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
                />
              </div>

              <div>
                <label htmlFor="newPlayerLastName" className="mb-1 block text-sm font-medium text-slate-700">
                  Фамилия
                </label>
                <input
                  id="newPlayerLastName"
                  value={newPlayerLastName}
                  onChange={(event) => {
                    setNewPlayerLastName(event.target.value);
                  }}
                  placeholder="Въведи фамилия"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
                />
              </div>

              <div>
                <label htmlFor="newPlayerNickname" className="mb-1 block text-sm font-medium text-slate-700">
                  Прякор
                </label>
                <input
                  id="newPlayerNickname"
                  value={newPlayerNickname}
                  onChange={(event) => {
                    setNewPlayerNickname(event.target.value);
                  }}
                  placeholder="Въведи прякор"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
                />
              </div>

              <div>
                <label htmlFor="newPlayerAvatarUrl" className="mb-1 block text-sm font-medium text-slate-700">
                  URL на аватар
                </label>
                <input
                  id="newPlayerAvatarUrl"
                  value={newPlayerAvatarUrl}
                  onChange={(event) => {
                    setNewPlayerAvatarUrl(event.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
                />

                <div className="mt-3 flex items-center gap-3">
                  <PlayerAvatar
                    src={newPlayerAvatarUrl.trim() || null}
                    fullName={newPlayerFirstName.trim() || 'Играч'}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarPickerOpen(true);
                    }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Избери аватар
                  </button>
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={newPlayerIsActive}
                  onChange={(event) => {
                    setNewPlayerIsActive(event.target.checked);
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                Активен
              </label>
            </div>
          )}

          <div>
            <label htmlFor="initialTeamId" className="mb-1 block text-sm font-medium text-slate-700">
              Начален отбор
            </label>
            <select
              id="initialTeamId"
              value={selectedTeamId}
              onChange={(event) => {
                setSelectedTeamId(event.target.value);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            >
              <option value="">Избери отбор</option>
              {(campTeamsQuery.data ?? []).map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {campTeamsQuery.isSuccess && (campTeamsQuery.data ?? []).length === 0 ? (
              <p className="mt-1 text-sm text-red-600">Първо създай отбор в лагера, преди да добавяш участници.</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                resetAddFlowState();
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Отказ
            </button>
            <button
              type="button"
              onClick={() => {
                void handleSubmitAddParticipant();
              }}
              disabled={isSubmittingAddFlow || campTeamsQuery.data?.length === 0}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingAddFlow ? 'Запазване...' : 'Добави участник'}
            </button>
          </div>
        </div>
      </ModalDrawer>

      <ModalDrawer
        open={avatarPickerOpen}
        title="Избери аватар"
        onClose={() => {
          setAvatarPickerOpen(false);
        }}
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <AssetPicker
            manifest="avatars"
            selectedUrl={newPlayerAvatarUrl.trim()}
            onSelect={(url) => {
              setNewPlayerAvatarUrl(url);
              setAvatarPickerOpen(false);
            }}
            title="Избери аватар"
          />
        </div>
      </ModalDrawer>

      {participationsQuery.isLoading ? <LoadingState label="Зареждане на участниците..." /> : null}

      {participationsQuery.isError ? (
        <ErrorState
          message="Неуспешно зареждане на участниците в момента."
          onRetry={() => {
            void participationsQuery.refetch();
          }}
        />
      ) : null}

      {participationsQuery.isSuccess && participationsQuery.data.length === 0 ? (
        <EmptyState
          title="Все още няма участници"
          description="Добави играч, за да създадеш първото участие."
        />
      ) : null}

      {participationsQuery.isSuccess && participationsQuery.data.length > 0 ? (
        <SectionCard>
          <div className="space-y-1">
            <label htmlFor="participantSearch" className="block text-sm font-medium text-slate-700">
              Търсене
            </label>
            <input
              id="participantSearch"
              value={participantSearch}
              onChange={(event) => {
                setParticipantSearch(event.target.value);
              }}
              placeholder="Име, фамилия или прякор"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            />
          </div>
        </SectionCard>
      ) : null}

      {participationsQuery.isSuccess && participationsQuery.data.length > 0 && filteredParticipations.length === 0 ? (
        <EmptyState
          title="Няма намерени участници"
          description="Промени текста за търсене и опитай отново."
        />
      ) : null}

      {participationsQuery.isSuccess && participationsQuery.data.length > 0 && filteredParticipations.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {filteredParticipations.map((participation) => {
            const player = playersById.get(participation.playerId);
            const currentTeam = currentAssignmentByParticipationId.get(participation.id);

            return (
              <SectionCard key={participation.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">{getPlayerDisplayName(player)}</h4>
                      <p className="text-xs text-slate-600">ID на играч: {participation.playerId}</p>
                    </div>
                    <Badge tone="neutral">Участие</Badge>
                  </div>

                  <dl className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                    <div>
                      <dt className="text-xs text-slate-500">Точки</dt>
                      <dd className="mt-1">{participation.points}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Убийства</dt>
                      <dd className="mt-1">{participation.kills}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Убийства с нож</dt>
                      <dd className="mt-1">{participation.knifeKills}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Оцелявания</dt>
                      <dd className="mt-1">{participation.survivals}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Победи в двубой</dt>
                      <dd className="mt-1">{participation.duelWins}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Победи в масова битка</dt>
                      <dd className="mt-1">{participation.massBattleWins}</dd>
                    </div>
                  </dl>

                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <span className="font-medium text-slate-800">Текущ отбор: </span>
                    {currentTeam?.state === 'loading' ? 'Зареждане...'
                      : currentTeam?.state === 'error' ? 'Няма данни'
                      : currentTeam?.teamId ? (teamNameById.get(currentTeam.teamId) ?? currentTeam.teamId)
                      : 'Неразпределен'}
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
