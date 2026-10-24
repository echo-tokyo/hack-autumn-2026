package server

import (
	"backend/config"
	authhttpv1 "backend/internal/app/auth/controller/http/v1"
	authrepo "backend/internal/app/auth/repository"
	authuc "backend/internal/app/auth/usecase"
	occurrencehttpv1 "backend/internal/app/payment_occurrence/controller/http/v1"
	occurrencerepo "backend/internal/app/payment_occurrence/repository"
	occurrenceuc "backend/internal/app/payment_occurrence/usecase"
	paymenthttpv1 "backend/internal/app/recurring_payment/controller/http/v1"
	paymentrepo "backend/internal/app/recurring_payment/repository"
	paymentuc "backend/internal/app/recurring_payment/usecase"
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
	rpRepo := paymentrepo.NewRepoDB(dbStorage)
	occRepo := occurrencerepo.NewRepoDB(dbStorage)

	// create usecases
	authUCClient := authuc.NewUCClient(cfg, userRepoDB, authRepoCache)
	authUCMiddleware := authuc.NewUCMiddleware(cfg, authRepoCache)
	userUCAdminClient := useruc.NewUCAdminClient(cfg, userRepoDB)
	rpUC := paymentuc.NewUCAdminClient(cfg, rpRepo, occRepo)
	occUC := occurrenceuc.NewUC(cfg, occRepo)

	// create controllers
	authController := authhttpv1.NewController(cfg, authUCClient, valid)
	userControllerAdmin := userhttpv1.NewControllerAdmin(userUCAdminClient, valid)
	userController := userhttpv1.NewController(userUCAdminClient, valid)
	rpCtrl := paymenthttpv1.NewController(rpUC, valid)
	rpCtrlAdmin := paymenthttpv1.NewControllerAdmin(rpUC, valid)
	occCtrl := occurrencehttpv1.NewController(occUC, valid)

	// middlewares
	mwJWTRefresh := middleware.JWTRefresh(cfg, authUCMiddleware)
	mwJWTAccess := middleware.JWTAccess(cfg)
	mwAdminOnly := middleware.AdminOnly()
	// register endpoints
	apiV1 := s.fiberApp.Group("/api/v1")
	authhttpv1.RegisterEndpoints(apiV1, authController, mwJWTRefresh)
	userhttpv1.RegisterEndpoints(apiV1, userController, userControllerAdmin,
		mwJWTAccess, mwAdminOnly)
	paymenthttpv1.RegisterEndpoints(apiV1, rpCtrl, rpCtrlAdmin, mwJWTAccess, mwAdminOnly)
	occurrencehttpv1.RegisterEndpoints(apiV1, occCtrl, mwJWTAccess)
}
