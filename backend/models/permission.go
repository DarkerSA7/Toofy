package models

// Permission represents a system permission
type Permission struct {
	ID          string `json:"id" bson:"_id"`
	Name        string `json:"name" bson:"name"`           // e.g., "create_user", "delete_user"
	Description string `json:"description" bson:"description"`
	Category    string `json:"category" bson:"category"`   // e.g., "users", "posts"
}

// RolePermission maps roles to their permissions
type RolePermission struct {
	Role        string   `json:"role" bson:"_id"`          // admin, user
	Permissions []string `json:"permissions" bson:"permissions"` // list of permission IDs
}

// Predefined Permissions
var (
	// User Management Permissions
	PermCreateUser = "create_user"
	PermReadUser   = "read_user"
	PermUpdateUser = "update_user"
	PermDeleteUser = "delete_user"
	PermListUsers  = "list_users"

	// Role Management Permissions
	PermManageRoles = "manage_roles"
	PermManageLowerRoles = "manage_lower_roles"

	// Anime Management Permissions
	PermCreateAnime = "create_anime"
	PermEditAnime   = "edit_anime"
	PermDeleteAnime = "delete_anime"
	PermListAnime   = "list_anime"

	// Slider Management Permissions
	PermManageSlider = "manage_slider"

	// System Permissions
	PermViewDashboard = "view_dashboard"
	PermViewAnalytics = "view_analytics"
	PermAccessAdmin   = "access_admin"
)

// Default Role Permissions
var DefaultRolePermissions = map[string][]string{
	"admin": {
		// User Management
		PermCreateUser,
		PermReadUser,
		PermUpdateUser,
		PermDeleteUser,
		PermListUsers,
		PermManageRoles,
		// Anime Management
		PermCreateAnime,
		PermEditAnime,
		PermDeleteAnime,
		PermListAnime,
		// Slider Management
		PermManageSlider,
		// System
		PermViewDashboard,
		PermViewAnalytics,
		PermAccessAdmin,
	},
	"editor": {
		// User Management (limited - only lower roles)
		PermListUsers,
		PermUpdateUser,
		PermManageLowerRoles,
		// Anime Management
		PermCreateAnime,
		PermEditAnime,
		PermDeleteAnime,
		PermListAnime,
		// Slider Management
		PermManageSlider,
		// System
		PermViewDashboard,
		PermAccessAdmin,
	},
	"vip": {
		// View Only
		PermReadUser,
		PermListAnime,
		PermViewDashboard,
	},
	"user": {
		// View Only
		PermReadUser,
		PermViewDashboard,
	},
}

// GetPermissionsForRole returns all permissions for a given role
func GetPermissionsForRole(role string) []string {
	if perms, exists := DefaultRolePermissions[role]; exists {
		return perms
	}
	return []string{}
}

// HasPermission checks if a role has a specific permission
func HasPermission(role, permission string) bool {
	perms := GetPermissionsForRole(role)
	for _, p := range perms {
		if p == permission {
			return true
		}
	}
	return false
}

// GetRoleHierarchy returns the hierarchy level of a role (higher number = higher privilege)
func GetRoleHierarchy(role string) int {
	hierarchy := map[string]int{
		"admin":  3,
		"editor": 2,
		"vip":    1,
		"user":   0,
	}
	if level, exists := hierarchy[role]; exists {
		return level
	}
	return -1
}

// CanManageRole checks if userRole can manage targetRole
func CanManageRole(userRole, targetRole string) bool {
	// Admin can manage any role (including other admins)
	if userRole == "admin" {
		return true
	}
	
	userLevel := GetRoleHierarchy(userRole)
	targetLevel := GetRoleHierarchy(targetRole)
	
	// Other users can only manage roles lower than their own
	return userLevel > targetLevel
}
