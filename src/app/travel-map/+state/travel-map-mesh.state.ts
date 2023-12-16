import { createActionGroup, createFeature, createReducer, createSelector, on, props } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { type MeshElementState } from '../interfaces/mesh-element-state';
import { AXIS, MESH_TYPE, ROW_TYPE, type MeshProperties } from '../interfaces/travel-map-data';
import { convertCoordinatesToMeshId } from '../utils/mesh-id-converter';
import { TravelMapActions } from './+module-state';
import { type VersionedState } from './versioned-state';

export const TravelMapMeshActions = createActionGroup({
  source: 'Travel Map Mesh',
  events: {
    upsertMeshElement: props<{ value: MeshElementState }>(),
  },
});

export interface TravelMapMeshState {
  meshProperties: MeshProperties;
  meshMap: Record<string, MeshElementState>;
}

type TravelMapMeshStateInternal = TravelMapMeshState & VersionedState;

const initialState: TravelMapMeshStateInternal = {
  version: 1,
  seedVersion: 0,
  meshProperties: {
    type: MESH_TYPE.HEX,
    size: 0,
    meshLeftOffset: 0,
    meshTopOffset: 0,
    dimensions: {
      x: 0,
      y: 0,
    },
    typeData: {
      shift: {
        axis: AXIS.X,
        shiftType: ROW_TYPE.ODD,
        truncateShifted: true,
      },
    },
  },
  meshMap: {},
};

export const travelMapMeshFeature = createFeature({
  name: 'TravelMapMesh',
  reducer: createReducer(
    initialState,
    on(TravelMapActions.fromSeed, (state, props): TravelMapMeshStateInternal => {
      if (state.seedVersion === props.data.version) {
        return state;
      }
      const meshProperties: MeshProperties = Object.assign({}, props.data.mesh.properties);
      const meshMap: Record<string, MeshElementState> = {};
      if (meshProperties.type === MESH_TYPE.HEX) {
        const shiftTypeRemainder = meshProperties.typeData.shift.shiftType === ROW_TYPE.ODD ? 1 : 0;
        for (let y = 0; y < meshProperties.dimensions.y; y++) {
          for (let x = 0; x < meshProperties.dimensions.x; x++) {
            if (meshProperties.typeData.shift.truncateShifted) {
              if (meshProperties.typeData.shift.axis === AXIS.Y && x % 2 === shiftTypeRemainder) {
                continue;
              }
              if (
                meshProperties.typeData.shift.axis === AXIS.X &&
                x === meshProperties.dimensions.x - 1 &&
                y % 2 === shiftTypeRemainder
              ) {
                continue;
              }
            }

            const id = convertCoordinatesToMeshId(y, x);
            meshMap[id] = Object.assign(
              {
                id,
                title: id,
                fog: true,
              },
              state.meshMap?.[id] ?? {},
              props.data.mesh.meshMap[id] ?? {},
            );
          }
        }
      } else {
        // TODO add square support
        throw new Error('not supported');
      }
      return {
        ...state,
        seedVersion: props.data.version,
        meshProperties,
        meshMap,
      };
    }),
    on(TravelMapMeshActions.upsertMeshElement, (state, props): TravelMapMeshStateInternal => {
      return {
        ...state,
        meshMap: Object.assign(cloneDeep(state.meshMap), { [props.value.id]: props.value }),
      };
    }),
  ),
  extraSelectors: ({ selectMeshMap }) => ({
    selectMeshById: (meshId: string | undefined) =>
      createSelector(selectMeshMap, (meshMap) => (meshId !== undefined ? meshMap[meshId] : null)),
  }),
});
