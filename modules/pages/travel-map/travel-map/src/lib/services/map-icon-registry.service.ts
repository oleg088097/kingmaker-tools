import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, of, shareReplay, type Observable } from 'rxjs';
import { DEFAULT_OBJECT_ICON } from '../constants/default-object-icon';
import { ICON_TYPE } from '../interfaces/map-object-state';

export type IconRegistry = Record<string, string>;

// Important to notice: icons are expected in size ~ 512x512 and to be placed in second quadrant of coordinates system
// For now I cannot think of a simple way to handle different icons sizes/placement with Path2D without ~rendering icon first
// icon sets from https://game-icons.net/tags/building.html
// convert to svg sprite with https://svgsprite.com/tools/svg-sprite-generator/
@Injectable()
export class MapIconRegistryService {
  private readonly httpClient = inject(HttpClient);
  private readonly registrySourcePaths: Record<Exclude<ICON_TYPE, ICON_TYPE.default>, string> = {
    [ICON_TYPE.building]: 'assets/map-icons/building.svg',
    [ICON_TYPE.creature]: 'assets/map-icons/creature.svg',
  };

  private readonly unknownIcon: string =
    'M239 360q10.5 0 17.75-7.25T264 335q0-10.5-7.25-17.75T239 310q-10.5 0-17.75 7.25T214 335q0 10.5 7.25 17.75T239 360Zm-18-77h37q0-16.5 3.75-26t21.25-26q13-13 20.5-24.75t7.5-28.25q0-28-20.5-43t-48.5-15q-28.5 0-46.25 15T171 171l33 13q2.5-9 11.25-19.5t26.75-10.5q16 0 24 8.75t8 19.25q0 10-6 18.75T253 217q-22 19.5-27 29.5t-5 36.5Zm19 157q-41.5 0-78-15.75T98.5 381.5q-27-27-42.75-63.5T40 240q0-41.5 15.75-78T98.5 98.5q27-27 63.5-42.75T240 40q41.5 0 78 15.75T381.5 98.5q27 27 42.75 63.5T440 240q0 41.5-15.75 78T381.5 381.5q-27 27-63.5 42.75T240 440Zm0-40q67 0 113.5-46.5t46.5-113.5q0-67-46.5-113.5t-113.5-46.5q-67 0-113.5 46.5t-46.5 113.5q0 67 46.5 113.5t113.5 46.5Zm0-160Z';

  private readonly registries: Record<ICON_TYPE, Observable<IconRegistry>> = {
    [ICON_TYPE.building]: this.lazyLoadIconSet(this.registrySourcePaths.building),
    [ICON_TYPE.creature]: this.lazyLoadIconSet(this.registrySourcePaths.creature),
    [ICON_TYPE.default]: of({
      [DEFAULT_OBJECT_ICON]: this.unknownIcon,
    }).pipe(shareReplay({ refCount: true, bufferSize: 1 })),
  };

  private readonly unknownIcon$: Observable<string> = this.registries.default.pipe(
    map((registry) => registry['unknown']),
  );

  public getRegistry(iconType: ICON_TYPE): Observable<IconRegistry> {
    return this.registries[iconType];
  }

  public getIcon(iconName: string, iconType: ICON_TYPE): Observable<string> {
    return (
      this.registries[iconType]?.pipe(
        map((registry) => registry[iconName]),
        catchError(() => this.unknownIcon$),
      ) ?? this.unknownIcon$
    );
  }

  private lazyLoadIconSet(address: string): Observable<IconRegistry> {
    return this.httpClient.get(address, { responseType: 'text' }).pipe(
      map((response) => this.parseIconSet(response)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private parseIconSet(setString: string): IconRegistry {
    const parseResult: IconRegistry = {};
    const regExp = /id="([\w-]+)".+?d="([\w\s.-]+)"/gis;
    for (const regExpMatchArray of setString.matchAll(regExp)) {
      parseResult[regExpMatchArray[1]] = regExpMatchArray[2];
    }
    return parseResult;
  }
}
