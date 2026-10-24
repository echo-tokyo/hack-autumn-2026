package server

import (
	"backend/config"
	authhttpv1 "backend/internal/app/auth/controller/http/v1"
	authrepo "backend/internal/app/auth/repository"
	authuc "backend/internal/app/auth/usecase"
	"backend/internal/app/service/server/middleware"
	userhttpv1 "backend/internal/app/user/controller/http/v1"
	userrepo "backend/internal/app/user/repository"
	useruc "backend/internal/app/user/usecase"
	"backend/internal/pkg/cache"
	"backend/internal/pkg/db"
	"backend/internal/pkg/validator"
)

// registerEndpointsV1 register all endpoints for 1st version of API.
func (s *Server) registerEndpointsV1(cfg *config.Config, dbStorage *db.DB,
	cacheStorage cache.Storage, valid validator.Validator) {

	// create repos
	authRepoCache := authrepo.NewRepoCache(cfg, cacheStorage)
	userRepoDB := userrepo.NewRepoDB(cfg, dbStorage)
	// classRepoDB := classrepo.NewRepoDB(dbStorage)
	// taskRepoDB := taskrepo.NewRepoDB(dbStorage)
	// solRepoDB := solrepo.NewRepoDB(dbStorage)
	// statusRepoDB := statusrepo.NewRepoDB(dbStorage)
	// fileRepoDB := filerepo.NewRepoDB(dbStorage)
	// commentRepoDB := commentrepo.NewRepoDB(dbStorage)
	// create usecases
	authUCClient := authuc.NewUCClient(cfg, userRepoDB, authRepoCache)
	authUCMiddleware := authuc.NewUCMiddleware(cfg, authRepoCache)
	userUCAdminClient := useruc.NewUCAdminClient(cfg, userRepoDB)
	// classUCAdminClient := classuc.NewUCAdminClient(cfg, classRepoDB, userRepoDB)
	// taskUCTeacher := taskuc.NewUCTeacher(cfg, taskRepoDB, userRepoDB)
	// solUCClient := soluc.NewUCClient(cfg, solRepoDB, taskRepoDB)
	// solUCStudent := soluc.NewUCStudent(cfg, solRepoDB, statusRepoDB)
	// solUCTeacher := soluc.NewUCTeacher(cfg, solRepoDB, statusRepoDB)
	// fileUCClient := fileuc.NewUCClient(cfg, fileRepoDB)
	// commentUCClient := commentuc.NewUCClient(cfg, commentRepoDB, solRepoDB)
	// create controllers
	authController := authhttpv1.NewController(cfg, authUCClient, valid)
	userControllerAdmin := userhttpv1.NewControllerAdmin(userUCAdminClient, valid)
	userController := userhttpv1.NewController(userUCAdminClient, valid)
	// classControllerAdmin := classhttpv1.NewControllerAdmin(classUCAdminClient, valid)
	// classController := classhttpv1.NewController(classUCAdminClient, valid)
	// taskControllerTeacher := taskhttpv1.NewControllerTeacher(cfg, taskUCTeacher, valid)
	// solController := solhttpv1.NewController(solUCClient, valid)
	// solControllerStudent := solhttpv1.NewControllerStudent(cfg, solUCStudent, valid)
	// solControllerTeacher := solhttpv1.NewControllerTeacher(solUCTeacher, valid)
	// fileController := filehttpv1.NewController(fileUCClient, valid)
	// commentController := commenthttpv1.NewController(commentUCClient, valid)

	// middlewares
	mwJWTRefresh := middleware.JWTRefresh(cfg, authUCMiddleware)
	mwJWTAccess := middleware.JWTAccess(cfg)
	mwAdminOnly := middleware.AdminOnly()
	// register endpoints
	apiV1 := s.fiberApp.Group("/api/v1")
	authhttpv1.RegisterEndpoints(apiV1, authController, mwJWTRefresh)
	userhttpv1.RegisterEndpoints(apiV1, userController, userControllerAdmin,
		mwJWTAccess, mwAdminOnly)
	// classhttpv1.RegisterEndpoints(apiV1, classController, classControllerAdmin,
	// 	mwJWTAccess, middleware.Allow)
	// taskhttpv1.RegisterEndpoints(apiV1, taskControllerTeacher, mwJWTAccess, middleware.Allow)
	// solhttpv1.RegisterEndpoints(apiV1, solController, solControllerStudent, solControllerTeacher,
	// 	mwJWTAccess, middleware.Allow)
	// filehttpv1.RegisterEndpoints(apiV1, fileController, mwJWTAccess, middleware.Allow)
	// commenthttpv1.RegisterEndpoints(apiV1, commentController, mwJWTAccess, middleware.Allow)
}
