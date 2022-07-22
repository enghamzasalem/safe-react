import { useState, useEffect, useCallback } from 'react'
import local from 'src/utils/storage/local'
import { AllowedFeatures, PermissionStatus } from '../../types'

const BROWSER_PERMISSIONS = 'BROWSER_PERMISSIONS'

export type BrowserPermission = { feature: AllowedFeatures; status: PermissionStatus }

type BrowserPermissions = { [origin: string]: BrowserPermission[] }

type UseBrowserPermissionsReturnType = {
  permissions: BrowserPermissions
  getPermissions: (origin: string) => BrowserPermission[]
  updatePermission: (origin: string, feature: AllowedFeatures, selected: boolean) => void
  addPermissions: (origin: string, permissions: BrowserPermission[]) => void
  getAllowedFeaturesList: (origin: string) => string
}

const useBrowserPermissions = (): UseBrowserPermissionsReturnType => {
  const [permissions, setPermissions] = useState<BrowserPermissions>({})

  useEffect(() => {
    setPermissions(local.getItem(BROWSER_PERMISSIONS) || {})
  }, [])

  useEffect(() => {
    if (!!Object.keys(permissions).length) {
      local.setItem(BROWSER_PERMISSIONS, permissions)
    }
  }, [permissions])

  const getPermissions = useCallback(
    (origin: string) => {
      return permissions[origin] || []
    },
    [permissions],
  )

  const addPermissions = useCallback(
    (origin: string, selectedPermissions: BrowserPermission[]) => {
      setPermissions({ ...permissions, [origin]: selectedPermissions })
    },
    [permissions],
  )

  const getAllowedFeaturesList = useCallback(
    (origin: string): string => {
      return getPermissions(origin)
        .filter(({ status }) => status === PermissionStatus.GRANTED)
        .map((permission) => permission.feature)
        .join('; ')
    },
    [getPermissions],
  )

  const updatePermission = useCallback(
    (origin: string, feature: AllowedFeatures, selected: boolean) => {
      setPermissions({
        ...permissions,
        [origin]: permissions[origin].map((p) => {
          if (p.feature === feature) {
            p.status = selected ? PermissionStatus.GRANTED : PermissionStatus.DENIED
          }

          return p
        }),
      })
    },
    [permissions],
  )

  return {
    permissions,
    getPermissions,
    addPermissions,
    getAllowedFeaturesList,
    updatePermission,
  }
}

export { useBrowserPermissions }
