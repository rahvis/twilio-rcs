export const brandTokens = {
  name: 'WorkOnward',
  colors: {
    orange: '#ED6600',
    green: '#72A400',
    darkGray: '#3D3D3D',
    lightOrange: '#FFD3B3',
    lightGreen: '#DEF1B1',
    gray: '#909090',
    pageBackground: '#FFFFFF',
    softSurface: '#F6F7F2'
  },
  fonts: {
    primary: '"Open Sans", Arial, Helvetica, sans-serif'
  },
  rcs: {
    senderAccent: '#3D3D3D',
    assetPath: '/assets/rcs'
  }
} as const;

export function rcsAssetUrl(baseUrl: string, fileName: string): string {
  return `${baseUrl.replace(/\/+$/, '')}${brandTokens.rcs.assetPath}/${fileName}`;
}
