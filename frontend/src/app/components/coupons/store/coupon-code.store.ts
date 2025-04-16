import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  CouponCodeDto,
  CreateCouponCodeDto,
} from '../../../../dtos/coupon-code.dto';
import {
  CouponDto,
  CreateCouponDto,
  UpdateCouponDto,
} from '../../../../dtos/coupon.dto';
import { CampaignDto, CreateCampaignDto, UpdateCampaignDto } from '../../../../dtos/campaign.dto';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, EventEmitter, inject } from '@angular/core';
import { CouponService } from '../../../services/coupon.service';
import { CampaignService } from '../../../services/campaign.service';
import { CouponCodeService } from '../../../services/coupon-code.service';
import { catchError, concatMap, forkJoin, from, map, mergeMap, of, pipe, switchMap, tap, toArray } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { SnackbarService } from '../../../services/snackbar.service';
import {
  customerConstraintEnum,
  durationTypeEnum,
  itemConstraintEnum,
} from '../../../../enums';
import { EligibleItemsService } from '../../../services/eligible-items.service';
import { CustomerDto } from '../../../../dtos/customer.dto';
import { CustomerCouponCodeService } from '../../../services/customer-coupon-code.service';
import { CreateCustomerCouponCodeDto } from '../../../../dtos/customer-coupon-code.dto';

export const CreateSuccess = new EventEmitter<boolean>();
export const CreateError = new EventEmitter<string>();

const steps = [
  'create',
  'items/edit',
  'campaigns/create',
  'coupon-codes/create',
];

type UpsertCouponCodeState = {
  coupon: {
    data: CouponDto | null;
    isLoading: boolean | null;
    error: string | null;
  };
  campaign: {
    data: CampaignDto | null;
    isLoading: boolean | null;
    error: string | null;
  };
  couponCode: {
    data: CreateCouponCodeDto | null;
    isLoading: boolean | null;
    error: string | null;
  };
  onNext: boolean;
  onBack: boolean;
  couponCodes: CreateCouponCodeDto[] | null;
  codesWithSpecificCustomers: Map<string, CustomerDto[]> | null;
  createdCouponCodes: {
    data: CouponCodeDto[] | null;
    isLoading: boolean;
    error: string | null;
  };
  currentStep: number;
  totalSteps: number;
  couponCodeScreenIndex: number;
  lastAnimatedStep: number;
};

const initialState: UpsertCouponCodeState = {
  coupon: {
    data: null,
    isLoading: null,
    error: null,
  },
  campaign: {
    data: null,
    isLoading: null,
    error: null,
  },
  couponCode: {
    data: null,
    isLoading: null,
    error: null,
  },
  onNext: false,
  onBack: false,
  couponCodes: null,
  codesWithSpecificCustomers: new Map(),
  createdCouponCodes: {
    data: null,
    isLoading: false,
    error: null,
  },
  currentStep: 0,
  totalSteps: steps.length,
  couponCodeScreenIndex: 0,
  lastAnimatedStep: -1,
};

export const CouponCodeStore = signalStore(
  withState(initialState),
  withDevtools('upsert_coupon_code'),
  withMethods(
    (
      store,
      couponService = inject(CouponService),
      campaignService = inject(CampaignService),
      couponCodeService = inject(CouponCodeService),
      customerCouponCodeService = inject(CustomerCouponCodeService),
      eligibleItemsService = inject(EligibleItemsService),
      snackbarService = inject(SnackbarService)
    ) => ({
      setOnNext: () => {
        patchState(store, {
          coupon: {
            ...store.coupon(),
            isLoading: true,
          },
          onNext: !store.onNext(),
        });
      },

      setOnBack: () => {
        patchState(store, {
          onBack: !store.onBack(),
        });
      },

      fetchCoupon: rxMethod<{ organizationId: string; couponId: string }>(
        pipe(
          tap(() =>
            patchState(store, {
              coupon: {
                ...store.coupon(),
                isLoading: true,
              },
            })
          ),
          concatMap(({ organizationId, couponId }) => {
            return couponService.fetchCoupon(organizationId, couponId).pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    patchState(store, {
                      coupon: {
                        data: plainToInstance(CouponDto, response.data),
                        isLoading: false,
                        error: null,
                      },
                    });
                  }
                },
                error: (error: HttpErrorResponse) => {
                  if (error.status == 404) {
                    patchState(store, {
                      coupon: {
                        ...store.coupon(),
                        isLoading: false,
                      },
                    });
                    snackbarService.openSnackBar(
                      'Unable to fetch coupon',
                      undefined
                    );
                  }
                },
              })
            );
          })
        )
      ),

      createCoupon: rxMethod<{
        organizationId: string;
        coupon: CreateCouponDto;
      }>(
        pipe(
          tap(() =>
            patchState(store, {
              coupon: {
                ...store.coupon(),
                isLoading: true,
              },
            })
          ),
          concatMap(({ organizationId, coupon }) => {
            return couponService.createCoupon(organizationId, coupon).pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 201) {
                    patchState(store, {
                      coupon: {
                        data: plainToInstance(CouponDto, response.data),
                        isLoading: false,
                        error: null,
                      },
                    });
                    snackbarService.openSnackBar(
                      'Coupon created successfully',
                      undefined
                    );
                    CreateSuccess.emit();
                  }
                },
                error: (error: HttpErrorResponse) => {
                  snackbarService.openSnackBar(
                    'Unable to create coupon',
                    undefined
                  );
                  CreateError.emit(error.message);
                },
              })
            );
          })
        )
      ),

      updateCouponWithItems: rxMethod<{
        organizationId: string;
        couponId: string;
        itemConstraint: itemConstraintEnum;
        items: string[];
      }>(
        pipe(
          tap(() => {
            patchState(store, {
              coupon: {
                ...store.coupon(),
                isLoading: true,
              },
            });
          }),
          concatMap(({ organizationId, couponId, itemConstraint, items }) => {
            const shouldUpdateItems =
              itemConstraint === itemConstraintEnum.SPECIFIC;

            const updatedCoupon = new UpdateCouponDto();
            updatedCoupon.itemConstraint = itemConstraint;

            return forkJoin({
              updateCoupon: couponService.updateCoupon(
                organizationId,
                couponId,
                instanceToPlain(updatedCoupon)
              ),
              insertItems: shouldUpdateItems
                ? eligibleItemsService.addItemsForCoupon(
                    organizationId,
                    couponId,
                    items
                  )
                : of(null),
            });
          }),
          tapResponse({
            next: ({ updateCoupon }) => {
              patchState(store, {
                coupon: {
                  data: plainToInstance(CouponDto, updateCoupon.data!),
                  isLoading: false,
                  error: null,
                },
              });

              CreateSuccess.emit(true);
            },
            error: (error: HttpErrorResponse) => {
              snackbarService.openSnackBar(
                'Error configuring items',
                undefined
              );

              patchState(store, {
                coupon: {
                  ...store.coupon(),
                  isLoading: false,
                  error: error.message,
                },
              });
            },
          })
        )
      ),

      createCampaign: rxMethod<{
        couponId: string;
        campaign: CreateCampaignDto;
      }>(
        pipe(
          tap(() =>
            patchState(store, {
              campaign: {
                ...store.campaign(),
                isLoading: true,
              },
            })
          ),
          concatMap(({ couponId, campaign }) => {
            return campaignService
              .createCampaign(couponId, instanceToPlain(campaign))
              .pipe(
                tapResponse({
                  next: (response) => {
                    if (response.code == 201) {
                      patchState(store, {
                        campaign: {
                          data: plainToInstance(CampaignDto, response.data),
                          isLoading: false,
                          error: null,
                        },
                      });
                      snackbarService.openSnackBar(
                        'Campaign created successfully',
                        undefined
                      );
                      CreateSuccess.emit(true);
                    }
                  },
                  error: (error: HttpErrorResponse) => {
                    snackbarService.openSnackBar(
                      'Unable to create campaign',
                      undefined
                    );
                    CreateError.emit(error.message);
                  },
                })
              );
          })
        )
      ),

      fetchCampaign: rxMethod<{ couponId: string; campaignId: string }>(
        pipe(
          tap(() =>
            patchState(store, {
              campaign: {
                ...store.campaign(),
                isLoading: true,
              },
            })
          ),
          concatMap(({ couponId, campaignId }) => {
            return campaignService.fetchCampaign(couponId, campaignId).pipe(
              tapResponse({
                next: (response) => {
                  if (response.code == 200) {
                    patchState(store, {
                      campaign: {
                        data: plainToInstance(CampaignDto, response.data),
                        isLoading: false,
                        error: null,
                      },
                    });
                  }
                },
                error: (error: HttpErrorResponse) => {
                  if (error.status == 404) {
                    patchState(store, {
                      campaign: {
                        ...store.campaign(),
                        isLoading: false,
                      },
                    });
                    snackbarService.openSnackBar(
                      'Unable to fetch campaign',
                      undefined
                    );
                  }
                },
              })
            );
          })
        )
      ),

      setCouponCode: (couponCode: CreateCouponCodeDto) => {
        patchState(store, {
          couponCode: {
            ...store.couponCode(),
            data: {
              ...store.couponCode.data(),
              ...couponCode,
            },
          },
        });
      },

      setCouponCodeToNull() {
        patchState(store, {
          couponCode: {
            data: null,
            isLoading: null,
            error: null,
          },
        });
      },

      setCouponCodes: (couponCode: CreateCouponCodeDto) => {
        const couponCodes = store.couponCodes() ?? [];

        const existingIndex = couponCodes.findIndex(
          (c) => c.code?.toLowerCase() === couponCode.code?.toLowerCase()
        );

        let updatedCouponCodes: CreateCouponCodeDto[];

        if (existingIndex !== -1) {
          updatedCouponCodes = [...couponCodes];
          updatedCouponCodes[existingIndex] = couponCode;
        } else {
          updatedCouponCodes = [...couponCodes, couponCode];
        }

        patchState(store, {
          couponCodes: updatedCouponCodes,
        });
      },

      setCodeWithSpecificCustomers: (
        code: string,
        customers: CustomerDto[]
      ) => {
        const existingMap = store.codesWithSpecificCustomers();
        const updatedMap = new Map(
          Array.from(existingMap?.entries() ?? []).map(([key, value]) => [
            key,
            JSON.parse(JSON.stringify(value)),
          ])
        );

        updatedMap.set(code, customers);

        patchState(store, {
          codesWithSpecificCustomers: updatedMap,
        });
      },

      setCustomerConstraint(value: string) {
        patchState(store, {
          couponCode: {
            ...store.couponCode(),
            data: {
              ...store.couponCode.data(),
              customerConstraint:
                value == 'all'
                  ? customerConstraintEnum.ALL
                  : customerConstraintEnum.SPECIFIC,
            },
          },
        });
      },

      setDurationType(value: string) {
        patchState(store, {
          couponCode: {
            isLoading: store.couponCode.isLoading(),
            error: store.couponCode.error(),
            data: {
              ...store.couponCode.data(),
              durationType:
                value == 'forever'
                  ? durationTypeEnum.FOREVER
                  : durationTypeEnum.LIMITED,
            },
          },
        });
      },

      createCouponCodes: rxMethod<{
        organizationId: string;
        couponId: string;
        campaignId: string;
        couponCodes: CreateCouponCodeDto[];
        customersMap: Map<string, CustomerDto[]>;
      }>(
        pipe(
          tap(() =>
            patchState(store, {
              createdCouponCodes: {
                ...store.createdCouponCodes(),
                isLoading: true,
              },
            })
          ),
          concatMap(
            ({
              organizationId,
              couponId,
              campaignId,
              couponCodes,
              customersMap,
            }) => {
              const requests = couponCodes.map((couponCode) =>
                couponCodeService
                  .createCouponCode(organizationId, couponId, campaignId, instanceToPlain(couponCode))
                  .pipe(
                    mergeMap((response) => {
                      const createdCouponCode = plainToInstance(CouponCodeDto, response.data!);
              
                      if (
                        response.code === 201 &&
                        createdCouponCode.customerConstraint === customerConstraintEnum.SPECIFIC
                      ) {
                        const createdCode = createdCouponCode.code!;
                        const customers =
                          customersMap.get(createdCode)?.map((c) => c.customerId!) || [];
                        
                        const createCustomerCouponCodeDto = new CreateCustomerCouponCodeDto();
                        createCustomerCouponCodeDto.customers = customers;

                        // return new observable into the stream
                        return customerCouponCodeService
                          .addCustomers(
                            couponId,
                            campaignId,
                            createdCouponCode.couponCodeId!,
                            createCustomerCouponCodeDto
                          )
                          .pipe(map(() => response)); // keep response shape for forkJoin
                      }
              
                      return of(response); // fallback
                    }),
                    catchError((error: HttpErrorResponse) => {
                      snackbarService.openSnackBar(
                        'Failed to create some coupon codes',
                        undefined
                      );
              
                      patchState(store, {
                        createdCouponCodes: {
                          ...store.createdCouponCodes(),
                          isLoading: false,
                          error: error.message,
                        },
                      });
              
                      return of({ data: null, code: 500 }); // return dummy error response for forkJoin
                    })
                  )
              );

              return forkJoin(requests).pipe(
                tapResponse({
                  next: (responses) => {
                    const successful = responses
                      .filter((r) => r.code === 201)
                      .map((r) => plainToInstance(CouponCodeDto, r.data));

                    patchState(store, {
                      createdCouponCodes: {
                        data: successful,
                        isLoading: false,
                        error: null,
                      },
                    });

                    snackbarService.openSnackBar(
                      'Coupon codes created',
                      undefined
                    );

                    CreateSuccess.emit(true);
                  },
                  error: (error: HttpErrorResponse) => {
                    snackbarService.openSnackBar(
                      'Failed to create some coupon codes',
                      undefined
                    );
                    patchState(store, {
                      createdCouponCodes: {
                        ...store.createdCouponCodes(),
                        isLoading: false,
                        error: error.message,
                      },
                    });
                  },
                })
              );
            }
          )
        )
      ),

      resetCouponCodes: () => {
        patchState(store, {
          couponCodes: null,
        });
      },

      nextStep: () =>
        patchState(store, {
          currentStep: Math.min(
            store.currentStep() + 1,
            store.totalSteps() - 1
          ),
          lastAnimatedStep: store.currentStep() + 1,
        }),

      previousStep: () =>
        patchState(store, {
          currentStep: Math.max(store.currentStep() - 1, 0),
          lastAnimatedStep: store.currentStep() - 1,
        }),

      setCouponCodeScreenIndex: (i: number) => {
        patchState(store, {
          couponCodeScreenIndex: i,
          lastAnimatedStep: store.currentStep(), // animate if step doesn't change but screen does
        });
      },

      resetCouponCodeScreens: () => {
        patchState(store, {
          couponCodeScreenIndex: 0,
        });
      },

      setCurrentStep: (i: number) => {
        patchState(store, {
          currentStep: i
        })
      },

      updateCoupon: rxMethod<{organizationId: string, couponId: string, body: UpdateCouponDto}>(
        pipe(
          tap(() => {
            patchState(store, {
              coupon: {
                ...store.coupon(),
                isLoading: true
              }
            })
          }),
          switchMap(({organizationId, couponId, body}) => {
            return couponService.updateCoupon(organizationId, couponId, body).pipe(
              tapResponse({
                next: (response) => {
                  if(response.code == 200) {
                    patchState(store, {
                      coupon: {
                        isLoading: false,
                        error: null,
                        data: plainToInstance(CouponCodeDto, response.data)
                      }
                    })

                    CreateSuccess.emit(true);
                  }
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, {
                    coupon: {
                      isLoading: false,
                      error: error.message,
                      data: store.coupon.data()
                    }
                  })

                  CreateError.emit(error.message);
                  snackbarService.openSnackBar('Error updating coupon', undefined);
                }
              })
            )
          })
        )
      ),

      updateCampaign: rxMethod<{couponId: string, campaignId: string, body: UpdateCampaignDto}>(
        pipe(
          tap(() => {
            patchState(store, {
              campaign: {
                ...store.campaign(),
                isLoading: true,
              }
            })
          }),
          switchMap(({ couponId, campaignId, body }) => {
            return campaignService.updateCampaign(couponId, campaignId, body).pipe(
              tapResponse({
                next: (response) => {
                  if(response.code == 200) {
                    patchState(store, {
                      campaign: {
                        isLoading: false,
                        error: null,
                        data: plainToInstance(CampaignDto, response.data)
                      }
                    });
                    
                    CreateSuccess.emit(true);
                    snackbarService.openSnackBar('Campaign updated successfully', undefined);
                  }
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, {
                    campaign: {
                      error: error.message,
                      isLoading: false,
                      data: store.campaign.data()
                    }
                  });

                  CreateError.emit(error.message);
                  snackbarService.openSnackBar('Error updating campaign', undefined);
                }
              })
            )
          })
        )
      )
    }),
  ),
  withComputed((store) => ({
    progress1: computed(() => {
      const step = store.currentStep();
      if (step >= 1 && step < 2) return 50;
      if (step >= 2) return 100;
      return 0;
    }),
    progress2: computed(() => {
      const step = store.currentStep();
      if (step >= 3) return 100;
      return 0;
    }),
    progress3: computed(() => {
      if (store.currentStep() < 3) return 0;

      const fill = (store.couponCodeScreenIndex() / 3) * 100;
      return Math.min(fill, 100);
    }),

    animateBar1: computed(() => store.currentStep() === 1 || store.currentStep() === 2),
    animateBar2: computed(() => store.lastAnimatedStep() === 2),
    animateBar3: computed(
      () => store.currentStep() === 4 || store.currentStep() === 3
    ),
  }))
);
