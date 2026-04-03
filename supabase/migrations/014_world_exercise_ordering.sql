begin;

with normalized as (
  select
    id,
    row_number() over (
      partition by world_id
      order by position asc, created_at asc, id asc
    ) as new_position
  from public.world_exercises
)
update public.world_exercises as we
set position = normalized.new_position
from normalized
where we.id = normalized.id
  and we.position is distinct from normalized.new_position;

alter table public.world_exercises
  add constraint world_exercises_position_positive
  check (position > 0);

alter table public.world_exercises
  add constraint world_exercises_world_position_unique
  unique (world_id, position)
  deferrable initially deferred;

create or replace function public.reorder_world_exercises(
  p_world_id uuid,
  p_world_exercise_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_world_count integer;
  v_input_count integer;
  v_distinct_input_count integer;
  v_matching_count integer;
begin
  select public.get_user_role() into v_role;

  if v_role is distinct from 'admin' then
    raise exception 'Only admins can reorder world exercises';
  end if;

  if p_world_id is null then
    raise exception 'p_world_id is required';
  end if;

  v_input_count := coalesce(array_length(p_world_exercise_ids, 1), 0);

  if v_input_count = 0 then
    raise exception 'p_world_exercise_ids must contain at least one id';
  end if;

  select count(*)
  into v_world_count
  from public.world_exercises
  where world_id = p_world_id;

  if v_world_count = 0 then
    raise exception 'World has no exercises or does not exist';
  end if;

  select count(distinct id)
  into v_distinct_input_count
  from unnest(p_world_exercise_ids) as ids(id);

  if v_distinct_input_count <> v_input_count then
    raise exception 'p_world_exercise_ids contains duplicate ids';
  end if;

  if v_input_count <> v_world_count then
    raise exception 'p_world_exercise_ids must include every exercise in the world exactly once';
  end if;

  select count(*)
  into v_matching_count
  from public.world_exercises
  where world_id = p_world_id
    and id = any(p_world_exercise_ids);

  if v_matching_count <> v_world_count then
    raise exception 'p_world_exercise_ids contains ids that do not belong to the world';
  end if;

  set constraints world_exercises_world_position_unique deferred;

  with ordered_ids as (
    select
      id,
      ordinality::integer as new_position
    from unnest(p_world_exercise_ids) with ordinality as input(id, ordinality)
  )
  update public.world_exercises as we
  set position = ordered_ids.new_position
  from ordered_ids
  where we.id = ordered_ids.id
    and we.world_id = p_world_id;
end;
$$;

revoke all on function public.reorder_world_exercises(uuid, uuid[]) from public;
grant execute on function public.reorder_world_exercises(uuid, uuid[]) to authenticated;

commit;
