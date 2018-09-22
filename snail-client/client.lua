local function CreatePeer ()
	Wait(0)

	print('CREATE NEW PEER')

	local peerId = exports['simple-peer']:NUIWrapper(function (id, dispatch, setHandler)
		local connected

		local replies = {
			data = function (action)
				connected = true
				print('simple-peer:data')
			end,
			close = function ()
				connected = false
				print('simple-peer:close')
			end,
			-- FIXME Doesn't trigger
			connect = function ()
				connected = true
				print('simple-peer:connect')
			end,
			error = function ()
				connected = false -- NOTE
				print('simple-peer:error')
			end,
			signal = function (action)
				print('simple-peer:signal', action.payload)
				if not connected then
					TriggerServerEvent('snaildash:Remote', action.payload)
				end
			end,
		}

		setHandler(function (action)
			local listener = replies[action and action.type]

			if listener then
				listener(action)
			end
		end)

		RegisterNetEvent('snaildash:Remote')
		AddEventHandler('snaildash:Remote', function (data)
			dispatch({ type = 'connect', payload = data })
		end)

		dispatch({ type = 'open' }, function (action)
			local payload = action.payload
		end)

		Citizen.CreateThread(function ()
			local prev
			local disposed

			while not disposed do
				if connected then
					if not prev then
						prev = true
						dispatch({
							type = 'send',
							payload = { type = 'connect', payload = 'Welcome' }
						})
					end

					dispatch({
						type = 'send',
						payload = {
							type = 'stats',
							payload = {
								health = GetEntityHealth(PlayerPedId())
							}
						}
					})

				else
					if prev then
						prev = false
						disposed = true
					end
				end

				Wait(100)
			end

			return Citizen.CreateThread(CreatePeer)
		end)
	end)
end


--[[ Citizen.CreateThread(CreatePeer)

local RegistrationErrors = {
	[1] = 'Form failed validation.', -- Error: failed validation
	[2] = 'Email is already in use.', -- Error: Email in use
	[3] = 'Failed to save user.', -- Error: Failed to save user
	[4] = 'License is registered already.', -- Error: Already registered
}

RegisterNetEvent('snaildash:Register')
AddEventHandler('snaildash:Register', function (err, isRegistered)
	if err then
		if err == 4 and isRegistered then
			print('Account is created and verified')
		else
			print(RegistrationErrors[err] or RegistrationErrors[1])
		end
	else
		print('Registered user successfully')
	end
end)

TriggerServerEvent('snaildash:Register', 'Bob@gmail.com', '123456')

RegisterNetEvent('snaildash:Verify')
AddEventHandler('snaildash:Verify', function (err, isRegistered)
	if err then
		print(RegistrationErrors[err] or RegistrationErrors[1])
	else
		print('Verify user successfully')
	end
end) ]]
